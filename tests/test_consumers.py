import json
from channels.tests import ChannelTestCase, Client, apply_routes
from .consumers import MyConsumer, Demultiplexer, spy


class ConsumerTest(ChannelTestCase):

    def test_consumer_action(self):
        self.assertTrue(hasattr(MyConsumer.incr_counter, 'action_type'))
        self.assertEqual(MyConsumer.incr_counter.action_type, 'INCREMENT_COUNTER')

    def test_consumer(self):
        client = Client()
        with apply_routes([MyConsumer.as_route()]):
            spy.reset_mock()
            client.send_and_consume('websocket.connect', {'path': '/'})
            client.send_and_consume('websocket.receive', {
                'path': '/',
                'text': json.dumps({
                    'type': 'INCREMENT_COUNTER',
                    'payload': 2,
                }),
            })

            self.assertEqual(spy.call_count, 1)
            self.assertEqual(client.receive(), {
                'text': json.dumps({
                    'type': 'INCREMENTED_COUNTER',
                    'payload': 2,
                }),
            })

    def test_multiplexer(self):
        client = Client()
        with apply_routes([Demultiplexer.as_route()]):
            spy.reset_mock()
            client.send_and_consume('websocket.connect', {'path': '/'})
            client.send_and_consume('websocket.receive', {
                'path': '/',
                'text': json.dumps({
                    'stream': 'redux',
                    'payload': {
                        'type': 'INCREMENT_COUNTER',
                        'payload': 2,
                    }
                }),
            })
            self.assertEqual(spy.call_count, 1)
