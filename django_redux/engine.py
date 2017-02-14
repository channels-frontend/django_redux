from collections import defaultdict
import json

from django.contrib.auth import authenticate, login, get_user_model
from channels import Group


User = get_user_model()


def send_action(group_name, action):
    """
    Convenience method to dispatch redux actions from channels.

    Usage::

        send_action("group_name", {
            "type": "MY_ACTION",
            "payload": {
                "id": 1,
                "name": "Lorem",
            }
        })
    """
    data = {
        'text': json.dumps(action),
    }
    Group(group_name).send(data)


_registry = defaultdict(list)


def make_registrar():

    def registrar(action_type):
        def wrap(func):
            _registry[action_type].append(func)
            return func
        return wrap

    registrar.all = _registry
    return registrar


action = make_registrar()


class ActionEngine(object):
    """A simple dispatcher that consumes a Redux-style action and routes
    it to a method on the subclass, using the `action.type`.

    To associate a method to one or more redux actions, use the `@action`
    decorator::

        from django_react.engine import ActionEngine, action


        class Engine(ActionEngine):

            @action('INCREMENT_COUNTER')
            def incr_counter(self, message):
                self.send_to_group('broadcast', {
                    'type': 'INCREMENTED_COUNTER',
                    'incrementBy': message['incrementBy'],
                })


    Callers should use the `ActionEngine.dispath(message)`. Subclasses
    can use the `add` and `send` methods.
    """

    @classmethod
    def dispatch(cls, message):
        engine = cls(message)

        # Parse the websocket message into a JSON action
        action = json.loads(message.content['text'])

        # Simple protection to only expose upper case methods
        # to client-side directives
        action_type = action['type'].upper()

        methods = _registry[action_type]

        if not methods:
            raise NotImplementedError('{} not implemented'.format(action_type))

        [method(engine, action) for method in methods]

    def __init__(self, message):
        self.message = message

    def get_control_channel(self, user=None):
        # Current control channel name, unless told to return `user`'s
        # control channel
        if 'user' not in self.message.channel_session:
            return None
        if user is None:
            user = self.message.channel_session['user']
        return 'user.{0}'.format(user)

    def add(self, group):
        Group(group).add(self.message.reply_channel)

    def send(self, action, to=None):
        if to is None:
            to = self.message.reply_channel
        to.send({
            'text': json.dumps(action),
        })

    def send_to_group(self, group, action):
        self.send(action, to=Group(group))

    def connect(self):
        control = self.get_control_channel()
        if control is not None:
            self.add(control)
        self.add('broadcast')

    def disconnect(self):
        # Discard the channel from the control group
        control = self.get_control_channel()
        if control is not None:
            Group(control).discard(
                self.message.reply_channel
            )
