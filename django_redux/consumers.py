from channels.generic import websockets

from .engine import registry


class ReduxConsumer(websockets.JsonWebsocketConsumer):

    http_user = True

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

    def connect(self, message, **kwargs):
        pass

    def receive(self, action, **kwargs):
        # Simple protection to only expose upper case methods
        # to client-side directives
        action_type = action['type'].upper()

        methods = registry[action_type]

        if not methods:
            raise NotImplementedError('{} not implemented'.format(action_type))

        [method(self, action) for method in methods]

    def disconnect(self, message, **kwargs):
        pass
