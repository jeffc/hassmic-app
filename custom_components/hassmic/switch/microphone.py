"""Defines the mute switch."""

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from ..proto.hassmic import *
from . import base

_LOGGER = logging.getLogger(__name__)


class Microphone(base.SwitchBase):
    """Defines a sensor with the wakeword state."""

    _attr_is_on = True

    @property
    def hassmic_entity_name(self):
        return "microphone"

    @property
    def icon(self):
        return "mdi:microphone" if self.is_on else "mdi:microphone-off"

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry) -> None:
        super().__init__(hass, config_entry)
        self.name = "Microphone"

        self._hassmic = config_entry.runtime_data

    def turn_on(self, **kwargs) -> None:
        self._attr_is_on = True
        self.send_mic_mute_status()
        self.schedule_update_ha_state()

    def turn_off(self, **kwargs) -> None:
        self._attr_is_on = False
        self.send_mic_mute_status()
        self.schedule_update_ha_state()

    def handle_connection_state_change(self, new_state: bool):
        """If the remote device just reconnected, remind it what mic_mute status it should have."""
        super().handle_connection_state_change(new_state)
        if new_state:
            self.send_mic_mute_status()

    def send_mic_mute_status(self):
        """Send the mic mute status to the remote."""
        _LOGGER.debug(
            "Sending signal to turn %s microphone", "on" if self._attr_is_on else "off"
        )
        self._hassmic.connection_manager.send_enqueue(
            ServerMessage(set_mic_mute=not self._attr_is_on)
        )


# vim: set ts=4 sw=4:
