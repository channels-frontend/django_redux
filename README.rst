Django Redux
=============================

A re-usable bridge between Django channels and Redux.

Quickstart
----------

::

    $ pip install django_redux
    $ npm install django-channels django_redux

Create a file called `engine.py` for your project::

    from django_redux import action, AsyncReduxConsumer


    class MyConsumer(AsyncReduxConsumer):

        async def connect(self, message):
            if message.user.is_authenticated:
                await self.send_json({
                    'type': 'SET_USER',
                    'user': {
                        'username': self.message.user.username,
                    }
                })

        # This method will be called when the `INCREMENT_COUNTER` action gets
        # fired from the JS via the reduxBridge (see below).
        @action('INCREMENT_COUNTER')
        async def incr_counter(self, message):
            await self.send_json({'type': 'INCREMENTED_COUNTER', 'incrementBy': message['incrementBy']})


In your js entry point::

    // app.js

    import React from 'react';

    import { render } from 'react-dom';
    import { Provider } from 'react-redux';
    import { createStore, } from 'redux';

    import reducer from '../reducers';
    import Root from '../containers/Root.react';

    import { WebSocketBridge } from 'django-channels';
    import { eventToAction } from 'django_redux';

    const store = createStore(
      reducer,
    );


    export const reduxBridge = new WebSocketBridge();
    reduxBridge.connect("ws://localhost:8000/ws/");
    reduxBridge.addEventListener("message", eventToAction(store));

    render(
      <Provider store={store}>
        <Root />
      </Provider>,
      document.getElementById('root')
    );

To send an action from redux::

    import { createAction } from 'redux-actions';

    import ActionTypes from './constants';
    import { reduxBridge } from './app';


    export const incrementCounter = createAction(ActionTypes.INCREMENT_COUNTER, (incrementBy) => {
      reduxBridge.send({
        type: ActionTypes.INCREMENT_COUNTER,
        incrementBy
      });
    });

To send an action from the backend::

    from django_redux import send_action

    await send_action('mygroup', {
        'type': 'ACTION_NAME',
        'payload': {'any': 'thing'},
    })

Groups
------

All clients are automatically added to a group called `"broadcast"`.

Authenticated users are automatically added to a group called `"user.{user.pk}"` so you they can be conveniently addressed.

TODO:

* Tests
    * ``send_action``
* Data binding
* Docs
    * Multiplexing

Credits
-------

Most of this code is adapted from `johnpaulett/channel_chat <https://github.com/johnpaulett/channel_chat>`_.
