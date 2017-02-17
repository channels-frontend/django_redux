from django_redux.engine import action
from django_redux.consumers import ReduxConsumer


class MyConsumer(ReduxConsumer):

    def connect(self, message, **kwargs):
        if message.user.is_authenticated():
            self.send({
                'type': 'SET_USER',
                'user': {
                    'username': self.message.user.username,
                }
            })

    @action('INCREMENT_COUNTER')
    def incr_counter(self, message):
        self.group_send('broadcast', {'type': 'INCREMENTED_COUNTER', 'incrementBy': message['payload']})
