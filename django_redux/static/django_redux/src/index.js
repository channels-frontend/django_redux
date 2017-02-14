import ReconnectingWebSocket from 'reconnecting-websocket';


const receiveSocketMessage = (store, action) => {
  /* We cheat by using the Redux-style Actions as our
   * communication protocol with the server. This hack allows
   * the server to directly act as a Action Creator, which we
   * simply `dispatch()`.  Consider separating communication format
   * from client-side action API.
   */
  return store.dispatch(action);
};

const reconnect = (state) => {
  // add recovery logic here..
};


let _socket = null;

export const WebsocketBridge = {
  connect: () => {
    // Use wss:// if running on https://
    const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${scheme}://${window.location.host}/ws`;
    _socket = new ReconnectingWebSocket(url);
  },

  listen: (store) => {
    _socket.onmessage = (event) => {
      const action = JSON.parse(event.data);
      receiveSocketMessage(store, action);
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
    _socket.send(JSON.stringify(action));
  },
};

export default WebsocketBridge;
