Django Redux
=============================

A re-usable bridge between Django channels and Redux.

Quickstart
----------

::

    $ pip install django_redux
    $ npm install django_redux

Create a file called `engine.py` for your project:

.. code-block:: python

    from django_redux import action, ReduxConsumer


    class MyConsumer(ReduxConsumer):

        def connect(self, message, **kwargs):
            if message.user.is_authenticated():
                self.send({
                    'type': 'SET_USER',
                    'user': {
                        'username': self.message.user.username,
                    }
                })

        # This method will be called when the `INCREMENT_COUNTER` action gets
        # fired from the JS via the reduxBridge (see below).
        @action('INCREMENT_COUNTER')
        def incr_counter(self, message):
            self.group_send('broadcast', {'type': 'INCREMENTED_COUNTER', 'incrementBy': message['incrementBy']})

Create a file called `routing.py` for your project:

.. code-block:: python

    from channels.routing import route_class
    from .consumers import MyConsumer

    channel_routing = [
        route_class(MyConsumer),
    ]

in your settings:

.. code-block:: python

    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'asgi_redis.RedisChannelLayer',
            'CONFIG': {
                'hosts': [('localhost', 6379)],
            },
            'ROUTING': 'myproject.routing.channel_routing',
        },
    }

In your js entry point:

.. code-block:: javascript

    import React from 'react';

    import { render } from 'react-dom';
    import { Provider } from 'react-redux';
    import { createStore, } from 'redux';

    import reducer from '../reducers';
    import Root from '../containers/Root.react';

    import { reduxBridge } from 'django_redux';

    const store = createStore(
      reducer,
    );


    reduxBridge.connect();
    reduxBridge.listen(store);

    render(
      <Provider store={store}>
        <Root />
      </Provider>,
      document.getElementById('root')
    );

To send an action from redux:

.. code-block:: javascript

    import { createAction } from 'redux-actions';

    import ActionTypes from './constants';
    import { reduxBridge } from 'django_redux';


    export const incrementCounter = createAction(ActionTypes.INCREMENT_COUNTER, (incrementBy) => {
      reduxBridge.send({
        type: ActionTypes.INCREMENT_COUNTER,
        incrementBy
      });
    });

To send an action from channels:

.. code-block:: python

    from django_redux import send_action

    send_action('mygroup', {
        'type': 'ACTION_NAME',
        'payload': {'any': 'thing'},
    })

Options
-------

In addition to the options accepted by `reconnecting-websocket <https://github.com/pladaria/reconnecting-websocket#configure>`_, the ``ReduxBridge()`` constructor accepts the following options.

``onreconnect: (dispatch, getState) => ()``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The function passed to ``onreconnect`` will be called when the websocket reconnects after being dropped. This is intended to provide you with a way to call some recovery logic.


TODO
----

* Tests
    * ``send_action``
* Data binding
* Docs
    * ``ReduxConsumer.get_control_channel``
    * Multiplexing

Credits
-------

Most of this code is adapted from `johnpaulett/channel_chat <https://github.com/johnpaulett/channel_chat>`_.
