"""Define common exception types."""


class BadMessageException(Exception):
    """Exception type asserts a bad message receipt."""


class BadHassMicClientInfoException(Exception):
    """Exception type asserts a bad opening info message."""


class AlreadyRunningException(Exception):
    """Exception type asserts a task was asked to start that's already running."""
