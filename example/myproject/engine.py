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

    @action('INCREMENT_COUNTER')
    def incr_counter(self, message):
        self.send_to_group('broadcast', {'type': 'INCREMENTED_COUNTER', 'incrementBy': message['incrementBy']})
