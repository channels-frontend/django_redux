import { WebSocket, Server } from 'mock-socket';
import { ReduxBridge } from '../src/';



describe('ReduxBridge', () => {
  const mockServer = new Server('ws://localhost');
  const serverReceivedMessage = jest.fn();
  mockServer.on('message', serverReceivedMessage);

  beforeEach(() => {
    serverReceivedMessage.mockReset();
  });

  it('Connects', () => {
    const reduxBridge = new ReduxBridge();
    reduxBridge.connect('ws://localhost');
  });
  it('Processes messages', () => {
    const reduxBridge = new ReduxBridge();
    const store = {
      dispatch: jest.fn(),
    }
    reduxBridge.connect('ws://localhost');
    reduxBridge.listen(store);

    mockServer.send('{"type": "test", "payload": "message 1"}');
    mockServer.send('{"type": "test", "payload": "message 2"}');

    expect(store.dispatch.mock.calls.length).toBe(2);
    expect(store.dispatch.mock.calls[0][0]).toEqual({"type": "test", "payload": "message 1"});
  });
  it('Ignores multiplexed messages for unregistered streams', () => {
    const reduxBridge = new ReduxBridge();
    const store = {
      dispatch: jest.fn(),
    }

    reduxBridge.connect('ws://localhost');
    reduxBridge.listen(store);

    mockServer.send('{"stream": "stream1", "payload": {"type": "test", "payload": "message 1"}}');
    expect(store.dispatch.mock.calls.length).toBe(0);

  });
  it('Demultiplexes messages only when they have a stream', () => {
    const reduxBridge = new ReduxBridge();
    const myMock = jest.fn();
    const myMock2 = jest.fn();
    const myMock3 = jest.fn();

    const store = {
      dispatch: myMock,
    }

    reduxBridge.connect('ws://localhost');
    reduxBridge.listen(store);
    reduxBridge.demultiplex('stream1', myMock2);
    reduxBridge.demultiplex('stream2', myMock3);

    mockServer.send('{"type": "test", "payload": "message 1"}');
    expect(myMock.mock.calls.length).toBe(1);
    expect(myMock2.mock.calls.length).toBe(0);
    expect(myMock3.mock.calls.length).toBe(0);

    mockServer.send('{"stream": "stream1", "payload": {"type": "test", "payload": "message 1"}}');

    expect(myMock.mock.calls.length).toBe(1);
    expect(myMock2.mock.calls.length).toBe(1);
    expect(myMock3.mock.calls.length).toBe(0);

    expect(myMock2.mock.calls[0][0]).toEqual(store);
    expect(myMock2.mock.calls[0][1]).toEqual({"type": "test", "payload": "message 1"});
    expect(myMock2.mock.calls[0][2]).toBe("stream1");

    mockServer.send('{"stream": "stream2", "payload": {"type": "test", "payload": "message 2"}}');

    expect(myMock.mock.calls.length).toBe(1);
    expect(myMock2.mock.calls.length).toBe(1);
    expect(myMock3.mock.calls.length).toBe(1);

    expect(myMock3.mock.calls[0][0]).toEqual(store);
    expect(myMock3.mock.calls[0][1]).toEqual({"type": "test", "payload": "message 2"});
    expect(myMock3.mock.calls[0][2]).toBe("stream2");
  });
  it('Demultiplexes messages', () => {
    const reduxBridge = new ReduxBridge();
    const myMock = jest.fn();
    const myMock2 = jest.fn();

    const store = {
      dispatch: jest.fn(),
    }

    reduxBridge.connect('ws://localhost');
    reduxBridge.listen(store);

    reduxBridge.demultiplex('stream1', myMock);
    reduxBridge.demultiplex('stream2', myMock2);

    mockServer.send('{"type": "test", "payload": "message 1"}');
    mockServer.send('{"type": "test", "payload": "message 2"}');

    expect(myMock.mock.calls.length).toBe(0);
    expect(myMock2.mock.calls.length).toBe(0);

    mockServer.send('{"stream": "stream1", "payload": {"type": "test", "payload": "message 1"}}');

    expect(myMock.mock.calls.length).toBe(1);

    expect(myMock2.mock.calls.length).toBe(0);

    expect(myMock.mock.calls[0][0]).toEqual(store);
    expect(myMock.mock.calls[0][1]).toEqual({"type": "test", "payload": "message 1"});
    expect(myMock.mock.calls[0][2]).toBe("stream1");

    mockServer.send('{"stream": "stream2", "payload": {"type": "test", "payload": "message 2"}}');

    expect(myMock.mock.calls.length).toBe(1);
    expect(myMock2.mock.calls.length).toBe(1);

    expect(myMock2.mock.calls[0][0]).toEqual(store);
    expect(myMock2.mock.calls[0][1]).toEqual({"type": "test", "payload": "message 2"});
    expect(myMock2.mock.calls[0][2]).toBe("stream2");

  });
  it('Sends messages', () => {
    const reduxBridge = new ReduxBridge();

    reduxBridge.connect('ws://localhost');
    reduxBridge.send({"type": "test", "payload": "message 1"});

    expect(serverReceivedMessage.mock.calls.length).toBe(1);
    expect(serverReceivedMessage.mock.calls[0][0]).toEqual(JSON.stringify({"type": "test", "payload": "message 1"}));
  });
  it('Multiplexes messages', () => {
    const reduxBridge = new ReduxBridge();

    reduxBridge.connect('ws://localhost');
    reduxBridge.stream('stream1').send({"type": "test", "payload": "message 1"});

    expect(serverReceivedMessage.mock.calls.length).toBe(1);
    expect(serverReceivedMessage.mock.calls[0][0]).toEqual(JSON.stringify({
      "stream": "stream1",
      "payload": {
        "type": "test", "payload": "message 1",
      },
    }));
  });
});
