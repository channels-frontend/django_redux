import inspect

from channels.generic import websockets


class ReduxConsumer(websockets.JsonWebsocketConsumer):

    http_user = True

    def _list_actions(self):
        methods = inspect.getmembers(self, predicate=inspect.ismethod)
        return [m[1] for m in methods if hasattr(m[1], 'action_type')]

    def _get_actions(self, action_type):
        methods = inspect.getmembers(self, predicate=inspect.ismethod)
        return [m[1] for m in methods if hasattr(m[1], 'action_type') and m[1].action_type == action_type]

    def get_control_channel(self, user=None):
        # Current control channel name, unless told to return `user`'s
        # control channel
        if 'user' not in self.message.channel_session:
            return None
        if user is None:
            user = self.message.channel_session['user']
        return 'user.{0}'.format(user)

    def connection_groups(self, **kwargs):
        """
        Called to return the list of groups to automatically add/remove
        this connection to/from.
        """
        groups = ['broadcast']
        control = self.get_control_channel()
        if control is not None:
            groups.append(control)
        return groups

    def receive(self, action, multiplexer=None, **kwargs):
        # Simple protection to only expose upper case methods
        # to client-side directives
        action_type = action['type'].upper()

        methods = self._get_actions(action_type)

        if not methods:
            raise NotImplementedError('{} not implemented'.format(action_type))

        [method(action, multiplexer=multiplexer) for method in methods]
