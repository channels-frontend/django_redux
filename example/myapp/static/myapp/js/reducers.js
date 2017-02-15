import ActionTypes from './constants';


const initialState = {
  counter: 0
};


function reducer(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.INCREMENTED_COUNTER:
      return Object.assign({}, state, {
        counter: state.counter + action.incrementBy
      });
    case ActionTypes.SET_USER:
      return Object.assign({}, state, {
        currentUser: action.user
      });
    default:
      return state;
  }
}

export default reducer;
