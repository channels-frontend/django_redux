import mock

from channels.generic.websockets import WebsocketDemultiplexer

from django_redux import action, ReduxConsumer


spy = mock.MagicMock()


class MyConsumer(ReduxConsumer):

    def connect(self, message, **kwargs):
        if message.user.is_authenticated():
            self.send({
                'type': 'SET_USER',
                'user': {
                    'username': self.message.user.username,
                }
            })

    @action('INCREMENT_COUNTER')
    def incr_counter(self, message, **kwargs):
        spy()
        self.group_send('broadcast', {'type': 'INCREMENTED_COUNTER', 'payload': message['payload']})


class MyMultiplexConsumer(ReduxConsumer):

    def connect(self, message, multiplexer, **kwargs):
        if message.user.is_authenticated():
            multiplexer.send({
                'type': 'SET_USER',
                'user': {
                    'username': self.message.user.username,
                }
            })

    @action('INCREMENT_COUNTER')
    def incr_counter(self, message, multiplexer):
        spy()
        multiplexer.group_send('broadcast', stream='redux', payload={
            'type': 'INCREMENTED_COUNTER',
            'payload': message['payload'],
        })


class Demultiplexer(WebsocketDemultiplexer):

    # Wire your JSON consumers here: {stream_name : consumer}
    consumers = {
        "redux": MyMultiplexConsumer,
    }
