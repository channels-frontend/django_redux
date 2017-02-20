import { createAction } from 'redux-actions';

import ActionTypes from './constants';
import { reduxBridge } from 'django_redux';


export const incrementCounter = createAction(ActionTypes.INCREMENT_COUNTER, (incrementBy) => {
  reduxBridge.send({
    type: ActionTypes.INCREMENT_COUNTER,
    payload: incrementBy
  });
});
