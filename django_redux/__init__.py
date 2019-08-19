_version = "1.0.0"
__version__ = VERSION = tuple(map(int, _version.split('.')))

from .engine import action, send_action  # noqa
from .consumers import AsyncReduxConsumer  # noqa
