import React from 'react';

import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';

import reducer from '../reducers';
import Root from '../containers/Root.react';

import { WebsocketBridge } from 'django_redux';

const loggerMiddleware = createLogger();

const store = createStore(
  reducer,
  applyMiddleware(
    thunkMiddleware,
    loggerMiddleware
  )
);


WebsocketBridge.connect();
WebsocketBridge.listen(store);

render(
  <Provider store={store}>
    <Root />
  </Provider>,
  document.getElementById('root')
);
