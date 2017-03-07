import { WebSocketBridge } from 'django-channels';


const noop = (...args) => {};

export class ReduxBridge extends WebSocketBridge {
  constructor(options) {
    options = Object.assign({}, {
      onreconnect: noop,
    }, options);
    super(options);
  }

  /**
   * Starts listening for messages on the websocket, demultiplexing if necessary.
   *
   * @param      {Object}  store         Your redux store.
   * @param      {Function}  [cb]         Callback to be execute when a message
   * arrives. The callback will receive `store`, `action` and `stream` parameters.
   * By default it will call `store.dispatch(action)`;
   *
   * @example
   * const webSocketBridge = new WebSocketBridge();
   * webSocketBridge.connect();
   * webSocketBridge.listen(store);
   */
  listen(store, cb = this.storeDispatch) {
    this.default_cb = cb;
    this._socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      let action;
      let stream;
      if (msg.stream !== undefined) {
        action = msg.payload;
        stream = msg.stream;
        const stream_cb = this.streams[stream];
        stream_cb ? stream_cb(store, action, stream) : null;
      } else {
        action = msg;
        stream = null;
        this.default_cb ? this.default_cb(store, action, stream) : null;
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
export const reduxBridge = new ReduxBridge();
