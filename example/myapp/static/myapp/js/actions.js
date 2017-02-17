import { createAction } from 'redux-actions';

import ActionTypes from './constants';
import { WebsocketBridge } from 'django_redux';


export const incrementCounter = createAction(ActionTypes.INCREMENT_COUNTER, (incrementBy) => {
  WebsocketBridge.send({
    type: ActionTypes.INCREMENT_COUNTER,
    payload: incrementBy
  });
});
