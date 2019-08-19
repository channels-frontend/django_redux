import inspect
from channels.generic import websocket


class AsyncReduxConsumer(websocket.AsyncJsonWebsocketConsumer):

    async def connect(self):
        await super().connect()
        await self.channel_layer.group_add("broadcast", self.channel_name)
        self.user = self.scope.get("user")

        if self.user is not None and self.user.is_authenticated:
            await self.channel_layer.group_add(f"user.{self.user.pk}", self.channel_name)

    def _list_actions(self):
        methods = inspect.getmembers(self, predicate=inspect.ismethod)
        return [m[1] for m in methods if hasattr(m[1], 'action_type')]

    def _get_actions(self, action_type):
        methods = inspect.getmembers(self, predicate=inspect.ismethod)
        return [m[1] for m in methods if hasattr(m[1], 'action_type') and m[1].action_type == action_type]

    async def receive_json(self, action, **kwargs):
        # Simple protection to only expose upper case methods
        # to client-side directives
        action_type = action['type'].upper()

        methods = self._get_actions(action_type)

        if not methods:
            raise NotImplementedError('{} not implemented'.format(action_type))

        [await method(action) for method in methods]

    async def broadcast(self, action):
        data = {
            'type': "redux.action",
            'action': action,
        }
        await self.channel_layer.group_send("broadcast", data)

    async def redux_action(self, event):
        await self.send_json(event["action"])
