_version = "0.0.12"
__version__ = VERSION = tuple(map(int, _version.split('.')))

from .engine import action, send_action  # noqa
from .consumers import ReduxConsumer  # noqa
