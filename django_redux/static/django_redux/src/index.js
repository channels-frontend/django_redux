import ReconnectingWebSocket from 'reconnecting-websocket';


const identity = (action, stream) => {
  return action;
}


export class WebSocketBridge {
  constructor() {
    this._socket = null;
    this.streams = {};
  }

  connect(url) {
    let _url;
    if (url === undefined) {
      // Use wss:// if running on https://
      const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
      _url = `${scheme}://${window.location.host}/ws`;
    } else {
      _url = url;
    }
    this._socket = new ReconnectingWebSocket(_url);
  }

  reconnect(state) {
    // add recovery logic here..
  }

  send(action) {
    this._socket.send(JSON.stringify(action));
  }

  demultiplex(stream, transform = identity) {
    this.streams[stream] = transform;
  }
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


class ReduxBridge extends WebSocketBridge {
  listen(store, transform = identity) {
    this._socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      let action;
      let stream;
      if (msg.stream !== undefined && this.streams[msg.stream] !== undefined) {
        action = msg.payload;
        stream = msg.stream;
        transform = this.streams[stream];
      } else {
        action = msg;
        stream = null;
      }
      this.receiveSocketMessage(store, action, stream, transform);
    };

    this._socket.onopen = () => {
      const state = store.getState();

      if (state.currentUser !== null) {
        // the connection was dropped. Call the recovery logic
        this.reconnect(state);
      }
    };

  }

  receiveSocketMessage(store, action, stream, transform) {
    /* We cheat by using the Redux-style Actions as our
     * communication protocol with the server. This hack allows
     * the server to directly act as a Action Creator, which we
     * simply `dispatch()`.  Consider separating communication format
     * from client-side msg API.
     */
    return store.dispatch(transform(action));
  }

}

export const reduxBridge = new ReduxBridge()
export default reduxBridge;
