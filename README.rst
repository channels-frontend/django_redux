Django Redux
=============================

Minimalistic example app that uses Django Channels to dispatch and responds to React/Redux actions.

Quickstart
----------

::

    $ pip install django_redux
    $ npm install django_redux

Create a file called `engine.py` for your project::

    from django_redux.engine import ActionEngine, action


    class Engine(ActionEngine):

        def connect(self):
            super().connect()
            if self.message.user.is_authenticated():
                self.send({
                    'type': 'SET_USER',
                    'user': {
                        'username': self.message.user.username,
                    }
                })

        # This method will be called when the `INCREMENT_COUNTER` action gets
        # fired from the JS via the WebsocketBridge (see below).
        @action('INCREMENT_COUNTER')
        def incr_counter(self, message):
            self.send_to_group('broadcast', {'type': 'INCREMENTED_COUNTER', 'incrementBy': message['incrementBy']})

in your settings::

    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'asgi_redis.RedisChannelLayer',
            'CONFIG': {
                'hosts': [('localhost', 6379)],
            },
            'ROUTING': 'django_redux.routing.channel_routing',
        },
    }

    REDUX_ENGINE = 'myproject.engine'

In your js entry point::

    import React from 'react';

    import { render } from 'react-dom';
    import { Provider } from 'react-redux';
    import { createStore, } from 'redux';

    import reducer from '../reducers';
    import Root from '../containers/Root.react';

    import { WebsocketBridge } from '../utils/WebsocketBridge';

    const store = createStore(
      reducer,
    );


    WebsocketBridge.connect();
    WebsocketBridge.listen(store);

    render(
      <Provider store={store}>
        <Root />
      </Provider>,
      document.getElementById('root')
    );

To send an action from redux::

    import { createAction } from 'redux-actions';

    import ActionTypes from './constants';
    import { WebsocketBridge } from 'django_redux';


    export const incrementCounter = createAction(ActionTypes.INCREMENT_COUNTER, (incrementBy) => {
      WebsocketBridge.send({
        type: ActionTypes.INCREMENT_COUNTER,
        incrementBy
      });
    });

To send an action from channels::

    from django_redux import send_action

    send_action('mygroup', {
        'type': 'ACTION_NAME',
        'payload': {'any': 'thing'},
    })

Credits
-------

Most of this code is adapted from `johnpaulett/channel_chat <https://github.com/johnpaulett/channel_chat>`_.
