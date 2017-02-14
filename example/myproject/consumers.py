from channels.auth import channel_session_user, channel_session_user_from_http

from .engine import Engine


@channel_session_user_from_http
def ws_connect(message):
    Engine(message).connect()


@channel_session_user
def ws_message(message):
    Engine.dispatch(message)


@channel_session_user
def ws_disconnect(message):
    Engine(message).disconnect()
