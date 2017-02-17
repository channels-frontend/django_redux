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

    @action('INCREMENT_COUNTER')
    def incr_counter(self, message, **kwargs):
        self.group_send('broadcast', {'type': 'INCREMENTED_COUNTER', 'payload': message['payload']})
