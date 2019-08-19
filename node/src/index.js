export function eventToAction(store) {

  return (event) => {
    const action = { ...event.data };
    if (event.origin) {
      action.meta = {
        ...action.meta,
        stream: event.origin,
      }
    }
    return store.dispatch(action);
  }
}
