import json

from channels import Group


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


def action(action_type):
    def wrap(func):
        func.action_type = action_type
        return func
    return wrap
