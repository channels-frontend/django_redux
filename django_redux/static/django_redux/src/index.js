import ReconnectingWebSocket from 'reconnecting-websocket';


const noop = (...args) => {};

/**
 * Bridge between Channels and plain javascript.
 *
 * @example
 * const webSocketBridge = new WebSocketBridge();
 * webSocketBridge.connect();
 * webSocketBridge.listen(function(action, stream) {
 *   console.log(action, stream);
 * });
 */
export class WebSocketBridge {
  constructor(options) {
    this._socket = null;
    this.streams = {};
    this.default_cb = null;
    this.options = Object.assign({}, {
      onopen: noop,
    }, options);
  }

  /**
   * Connect to the websocket server
   *
   * @param      {String}  [url]     The url of the websocket. Defaults to
   * `window.location.host`
   * @param      {String[]|String}  [protocols] Optional string or array of protocols.
   * @param      {Object} options Object of options for [`reconnecting-websocket`](https://github.com/joewalnes/reconnecting-websocket#options-1).
   * @example
   * const webSocketBridge = new WebSocketBridge();
   * webSocketBridge.connect();
   */
  connect(url, protocols, options) {
    let _url;
    if (url === undefined) {
      // Use wss:// if running on https://
      const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
      _url = `${scheme}://${window.location.host}/ws`;
    } else {
      _url = url;
    }
    this._socket = new ReconnectingWebSocket(_url, protocols, options);
  }

  /**
   * Starts listening for messages on the websocket, demultiplexing if necessary.
   *
   * @param      {Function}  [cb]         Callback to be execute when a message
   * arrives. The callback will receive `action` and `stream` parameters
   *
   * @example
   * const webSocketBridge = new WebSocketBridge();
   * webSocketBridge.connect();
   * webSocketBridge.listen(function(action, stream) {
   *   console.log(action, stream);
   * });
   */
  listen(cb) {
    this.default_cb = cb;
    this._socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      let action;
      let stream;
      if (msg.stream !== undefined && this.streams[msg.stream] !== undefined) {
        action = msg.payload;
        stream = msg.stream;
        const stream_cb = this.streams[stream];
        stream_cb ? stream_cb(action, stream) : null;
      } else {
        action = msg;
        stream = null;
        this.default_cb ? this.default_cb(action, stream) : null;
      }
    };

    this._socket.onopen = this.options.onopen;
  }

  /**
   * Adds a 'stream handler' callback. Messages coming from the specified stream
   * will call the specified callback.
   *
   * @param      {String}    stream  The stream name
   * @param      {Function}  cb      Callback to be execute when a message
   * arrives. The callback will receive `action` and `stream` parameters.

   * @example
   * const webSocketBridge = new WebSocketBridge();
   * webSocketBridge.connect();
   * webSocketBridge.listen();
   * webSocketBridge.demultiplex('mystream', function(action, stream) {
   *   console.log(action, stream);
   * });
   * webSocketBridge.demultiplex('myotherstream', function(action, stream) {
   *   console.info(action, stream);
   * });
   */
  demultiplex(stream, cb) {
    this.streams[stream] = cb;
  }

  /**
   * Sends a message to the reply channel.
   *
   * @param      {Object}  msg     The message
   *
   * @example
   * // We cheat by using the Redux-style Actions as our
   * // communication protocol with the server. Consider separating
   * // communication format from client-side action API.
   * webSocketBridge.send({type: 'MYACTION', 'payload': 'somepayload'});
   */
  send(msg) {
    this._socket.send(JSON.stringify(msg));
  }

  /**
   * Returns an object to send messages to a specific stream
   *
   * @param      {String}  stream  The stream name
   * @return     {Object}  convenience object to send messages to `stream`.
   * @example
   * // We cheat by using the Redux-style Actions as our
   * // communication protocol with the server. Consider separating
   * // communication format from client-side action API.
   * webSocketBridge.stream('mystream').send({type: 'MYACTION', 'payload': 'somepayload'})
   */
  stream(stream) {
    return {
      send: (action) => {
        const msg = {
          stream,
          payload: action
        }
        this._socket.send(JSON.stringify(msg));
      }
    }
  }

}

/**
 * Convenience singleton for `WebSocketBridge`.
 * @example
 * import { webSocketBridge } from 'django_redux';
 *
 * webSocketBridge.connect();
 * webSocketBridge.listen(function(action, stream) { console.log(action) });
 *
 * @type       {WebSocketBridge}
 */
export const webSocketBridge = new WebSocketBridge()

/**
 * Bridge between Channels and Redux.
 * By default dispatches actions received from channels to the redux store.
 *
 * @example
 * const reduxBridge = new ReduxBridge();
 * reduxBridge.connect();
 * reduxBridge.listen(store);
 */
class ReduxBridge extends WebSocketBridge {
  constructor(options) {
    options = Object.assign({}, {
      onreconnect: noop,
    }, options);
    super(options);
  }

  listen(store, cb = this.storeDispatch) {
    this.default_cb = cb;
    this._socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      let action;
      let stream;
      if (msg.stream !== undefined && this.streams[msg.stream] !== undefined) {
        action = msg.payload;
        stream = msg.stream;
        const stream_cb = this.streams[stream];
        stream_cb(store, action, stream)
      } else {
        action = msg;
        stream = null;
        this.default_cb(store, action, stream);
      }
    };

    this._socket.onopen = () => {
      const state = store.getState();

      if (state.currentUser !== null) {
        // the connection was dropped. Call the recovery logic
        this.options.onreconnect(state);
      }
    };

  }

  storeDispatch(store, action, stream) {
    return store.dispatch(action);
  }

}

/**
 * Convenience singleton for `ReduxSocketBridge`.
 * @example
 * import { ReduxBridge } from 'django_redux';
 *
 * ReduxBridge.connect();
 * ReduxBridge.listen(store);
 *
 * @type       {ReduxSocketBridge}
 */
export const reduxBridge = new ReduxBridge()
