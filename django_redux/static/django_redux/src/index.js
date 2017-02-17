import ReconnectingWebSocket from 'reconnecting-websocket';


const receiveSocketMessage = (store, msg) => {
  /* We cheat by using the Redux-style Actions as our
   * communication protocol with the server. This hack allows
   * the server to directly act as a Action Creator, which we
   * simply `dispatch()`.  Consider separating communication format
   * from client-side msg API.
   */
  let action;
  if (_socket.stream !== undefined && _socket.stream === msg.stream) {
    action = msg.payload;
  } else {
    action = msg;
  }
  if (action !== undefined) {
    return store.dispatch(action);
  }
};

const reconnect = (state) => {
  // add recovery logic here..
};


let _socket = null;

export const WebsocketBridge = {
  connect: (stream) => {
    // Use wss:// if running on https://
    const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${scheme}://${window.location.host}/ws`;
    _socket = new ReconnectingWebSocket(url);
    _socket.stream = stream;
  },

  listen: (store, stream) => {
    _socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      receiveSocketMessage(store, msg);
    };

    _socket.onopen = () => {
      const state = store.getState();

      if (state.currentUser !== null) {
        // the connection was dropped. Call the recovery logic
        reconnect(state);
      }
    };
  },

  send: (action) => {
    let msg;
    if (_socket.stream) {
      msg = {
        stream: _socket.stream,
        payload: action
      }
    } else {
      msg = action;
    }
    _socket.send(JSON.stringify(msg));
  },
};

export default WebsocketBridge;
