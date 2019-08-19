import pytest

from channels.testing import WebsocketCommunicator

from .consumers import MyConsumer, Demultiplexer
from .routing import application


def test_consumer_action():
    assert hasattr(MyConsumer.incr_counter, 'action_type')
    assert MyConsumer.incr_counter.action_type == 'INCREMENT_COUNTER'


@pytest.mark.asyncio
async def test_consumer():
    communicator = WebsocketCommunicator(application, "/ws/")
    await communicator.connect()
    await communicator.send_json_to({
        'type': 'INCREMENT_COUNTER',
        'payload': 2,
    })
    received = await communicator.receive_json_from()
    assert received == {
        'type': 'INCREMENTED_COUNTER',
        'payload': 2,
    }
    await communicator.disconnect()


@pytest.mark.asyncio
async def test_consumer_no_auth():
    communicator = WebsocketCommunicator(MyConsumer, "/")
    await communicator.connect()
    await communicator.send_json_to({
        'type': 'INCREMENT_COUNTER',
        'payload': 2,
    })
    received = await communicator.receive_json_from()
    assert received == {
        'type': 'INCREMENTED_COUNTER',
        'payload': 2,
    }
    await communicator.disconnect()


@pytest.mark.asyncio
async def __test_multiplexer():
    communicator = WebsocketCommunicator(Demultiplexer, "/")
    await communicator.connect()
    await communicator.send_json_to({
        'stream': 'redux',
        'payload': {
            'type': 'INCREMENT_COUNTER',
            'payload': 2,
        }
    })

    await communicator.disconnect()
