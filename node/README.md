### Usage

Channels Javascript wrapper for Redux.

To process messages:

```
import { ReduxBridge } from 'django_redux';
import { store } from './mystore';

const reduxBridge = new ReduxBridge();
reduxBridge.connect();
reduxBridge.listen(store);
```

To send messages:

```
reduxBridge.send({prop1: 'value1', prop2: 'value1'});

```

To demultiplex specific streams:

```
const reduxBridge = new ReduxBridge();
reduxBridge.connect();
reduxBridge.listen(store);
reduxBridge.demultiplex('mystream', function(store, action, stream) {
  console.log(action, stream);
  store.dispatch(action);
});
reduxBridge.demultiplex('myotherstream', function(store, action, stream) {
  console.info(action, stream);
  store.dispatch(action);
});
```

To send a message to a specific stream:

```
reduxBridge.stream('mystream').send({prop1: 'value1', prop2: 'value1'})
```
