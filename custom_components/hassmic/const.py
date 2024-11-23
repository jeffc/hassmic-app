"""Constants for the hassmic integration."""

from homeassistant.const import Platform

# The name of this integration
DOMAIN = "hassmic"

# The platforms this integration provides
PLATFORMS = [
    Platform.SENSOR,
    Platform.SWITCH,
    Platform.MEDIA_PLAYER,
    Platform.NUMBER,
]

# Possible states for sensors
STATE_LISTENING = "listening"
STATE_DETECTED = "detected"
STATE_ERROR = "error"
# vim: set ts=4 sw=4:
