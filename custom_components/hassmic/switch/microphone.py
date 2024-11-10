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
        _LOGGER.debug("Sending signal to turn on microphone")
        self._hassmic.connection_manager.send_enqueue(ServerMessage(set_mic_mute=False))
        self._attr_is_on = True
        self.schedule_update_ha_state()

    def turn_off(self, **kwargs) -> None:
        _LOGGER.debug("Sending signal to turn off microphone")
        self._hassmic.connection_manager.send_enqueue(ServerMessage(set_mic_mute=True))
        self._attr_is_on = False
        self.schedule_update_ha_state()
