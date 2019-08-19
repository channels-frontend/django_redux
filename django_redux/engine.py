from channels.layers import get_channel_layer


async def send_action(group_name, action):
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
    channel_layer = get_channel_layer()

    data = {
        'type': "redux.action",
        'action': action,
    }

    await channel_layer.group_send(
        group_name,
        data
    )


def action(action_type):
    def wrap(func):
        func.action_type = action_type
        return func
    return wrap
