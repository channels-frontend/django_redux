from channels.routing import route_class
from .consumers import MyConsumer

channel_routing = [
    route_class(MyConsumer),
]
