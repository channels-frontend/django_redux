import WS from "jest-websocket-mock";
import { WebSocketBridge } from 'django-channels';
import { eventToAction } from '../src/';


describe('ReduxBridge', () => {
  const URL = 'ws://localhost';
  const websocketOptions = { maxReconnectionDelay: 500, minReconnectionDelay: 50, reconnectionDelayGrowFactor: 1 };

  afterEach(() => {
    WS.clean();
  });

  test('Processes messages', async () => {
    const mockServer = new WS(URL, { jsonProtocol: true });
    const store = {
      dispatch: jest.fn(),
    };
    const reduxBridge = new WebSocketBridge();

    reduxBridge.connect(URL, undefined, websocketOptions);
    reduxBridge.addEventListener("message", eventToAction(store));
    await mockServer.connected;

    mockServer.send({"type": "test", "payload": "message 1"});
    mockServer.send({"type": "test", "payload": "message 2"});

    expect(store.dispatch.mock.calls.length).toBe(2);
    expect(store.dispatch.mock.calls[0][0]).toEqual({ type: 'test', payload: 'message 1' });
  });

  test('Ignores multiplexed messages for unregistered streams', async () => {
    const mockServer = new WS(URL, { jsonProtocol: true});
    const store = {
      dispatch: jest.fn(),
    };
    const reduxBridge = new WebSocketBridge();

    reduxBridge.connect(URL, undefined, websocketOptions);
    reduxBridge.addEventListener("message", eventToAction(store));
    await mockServer.connected;

    mockServer.send({"stream": "stream1", "payload": {"type": "test", "payload": "message 1"}});
    expect(store.dispatch.mock.calls.length).toBe(0);
  });

  test('Demultiplexes messages only when they have a stream', async () => {
    const mockServer = new WS(URL, { jsonProtocol: true });

    const store = {
      dispatch: jest.fn(),
    };
    const reduxBridge = new WebSocketBridge(store);

    const myMock2 = jest.fn();
    const myMock3 = jest.fn();

    reduxBridge.connect(URL, undefined, websocketOptions);

    await mockServer.connected;

    reduxBridge.addEventListener("message", eventToAction(store));
    reduxBridge.demultiplex('stream1', myMock2);
    reduxBridge.demultiplex('stream2', myMock3);

    mockServer.send({"type": "test", "payload": "message 1"});
    expect(store.dispatch.mock.calls.length).toBe(1);
    expect(myMock2.mock.calls.length).toBe(0);
    expect(myMock3.mock.calls.length).toBe(0);

    mockServer.send({"stream": "stream1", "payload": {"type": "test", "payload": "message 1"}});

    expect(store.dispatch.mock.calls.length).toBe(1);
    expect(myMock2.mock.calls.length).toBe(1);
    expect(myMock3.mock.calls.length).toBe(0);

    expect(myMock2.mock.calls[0][0].data).toEqual({ type: 'test', payload: 'message 1' });
    expect(myMock2.mock.calls[0][0].origin).toBe('stream1');

    mockServer.send({"stream": "stream2", "payload": {"type": "test", "payload": "message 2"}});

    expect(store.dispatch.mock.calls.length).toBe(1);
    expect(myMock2.mock.calls.length).toBe(1);
    expect(myMock3.mock.calls.length).toBe(1);

    expect(myMock3.mock.calls[0][0].data).toEqual({ type: 'test', payload: 'message 2' });
    expect(myMock3.mock.calls[0][0].origin).toBe('stream2');
  });

  test('Demultiplexes messages', async () => {
    const mockServer = new WS(URL, { jsonProtocol: true });

    const store = {
      dispatch: jest.fn(),
    };
    const store2 = {
      dispatch: jest.fn(),
    };
    const store3 = {
      dispatch: jest.fn(),
    };
    const reduxBridge = new WebSocketBridge();

    const myMock = jest.fn();
    const myMock2 = jest.fn();

    reduxBridge.connect(URL, undefined, websocketOptions);

    await mockServer.connected;

    reduxBridge.stream('stream1').addEventListener("message", eventToAction(store));
    reduxBridge.stream('stream1').addEventListener("message", eventToAction(store2));
    reduxBridge.demultiplex('stream2', eventToAction(store3));

    mockServer.send({"type": "test", "payload": "message 1"});
    mockServer.send({"type": "test", "payload": "message 2"});

    expect(store.dispatch.mock.calls.length).toBe(0);
    expect(store2.dispatch.mock.calls.length).toBe(0);
    expect(store3.dispatch.mock.calls.length).toBe(0);

    mockServer.send({"stream": "stream1", "payload": {"type": "test", "payload": "message 1"}});

    expect(store.dispatch.mock.calls.length).toBe(1);
    expect(store2.dispatch.mock.calls.length).toBe(1);
    expect(store3.dispatch.mock.calls.length).toBe(0);

    expect(store.dispatch.mock.calls[0][0]).toEqual({ type: 'test', payload: 'message 1', meta: {stream: 'stream1'} });
    expect(store2.dispatch.mock.calls[0][0]).toEqual({ type: 'test', payload: 'message 1', meta: {stream: 'stream1'} });

    mockServer.send({"stream": "stream2", "payload": {"type": "test", "payload": "message 2"}});

    expect(store.dispatch.mock.calls.length).toBe(1);
    expect(store2.dispatch.mock.calls.length).toBe(1);
    expect(store3.dispatch.mock.calls.length).toBe(1);

    expect(store3.dispatch.mock.calls[0][0]).toEqual({ type: 'test', payload: 'message 2', meta: {stream: 'stream2'} });

  });

});
