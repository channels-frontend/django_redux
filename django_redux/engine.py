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


registry = defaultdict(list)


def make_registrar():

    def registrar(action_type):
        def wrap(func):
            registry[action_type].append(func)
            return func
        return wrap

    registrar.all = registry
    return registrar


action = make_registrar()
