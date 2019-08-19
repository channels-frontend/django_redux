from django_redux import action, AsyncReduxConsumer


class MyConsumer(AsyncReduxConsumer):
    async def connect(self):
        await super().connect()
        if self.user is not None and self.user.is_authenticated:
            await self.send_json({
                'type': 'SET_USER',
                'user': {
                    'username': self.user.username,
                }
            })

    @action('INCREMENT_COUNTER')
    async def incr_counter(self, message):
        await self.broadcast({
            'type': 'INCREMENTED_COUNTER', 'payload': message['payload']
        })
