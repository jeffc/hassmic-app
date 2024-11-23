"""Defines the volume control for the announce audio output"""

from __future__ import annotations

import logging
import betterproto

from homeassistant.components.number.const import NumberMode
from homeassistant.components.number import NumberEntity, ENTITY_ID_FORMAT
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.const import PERCENTAGE

from .. import util
from ..proto import hassmic as proto

_LOGGER = logging.getLogger(__name__)


class AnnounceVolume(NumberEntity):
    """Represents a hassmic media player."""

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry) -> None:
        """Initialize."""
        super().__init__()
        self.hassmic_entity_name = "announce_volume"
        util.InitializeEntity(self, ENTITY_ID_FORMAT, hass, config_entry)

        self._hass = hass
        self._config_entry = config_entry
        self._hassmic = config_entry.runtime_data

        self._attr_state = None
        self._attr_mode = NumberMode.SLIDER
        self._attr_native_min_value = 0
        self._attr_native_max_value = 1
        self._attr_native_step = 0.01

    def set_native_value(self, volume: float) -> None:
        """Set the volume level."""
        if volume is None:
            _LOGGER.debug("Requested volume is None")
            return
        if not (0 <= volume and volume <= 1):
            _LOGGER.error(f"{volume} is not between 0 and 1")

        self.send_volume(volume)

    def handle_client_event(self, event: proto.ClientEvent):
        """Handle a client event."""
        (which, val) = betterproto.which_one_of(event, "event")

        match which:

            case "media_player_volume_change":
                if val.player == proto.MediaPlayerId.ID_ANNOUNCE:
                    self._attr_native_value = val.volume
                    self.send_volume(val.volume)
                    self.schedule_update_ha_state()
            case _:
                pass  # ignore cases not listed here

        self.schedule_update_ha_state()

    def handle_saved_settings(self, ss: proto.SavedSettings):
        if ss.announce_volume is not None:
            if self._attr_native_value is None:
                _LOGGER.debug(
                    "Setting announce volume to %f due to saved settings",
                    ss.announce_volume,
                )
                self._attr_native_value = ss.announce_volume
                self.schedule_update_ha_state()
            else:
                _LOGGER.warning(
                    "Got saved settings from client, but announce volume is already set!"
                )
        else:
            _LOGGER.warning(
                "Got saved settings from client, but no announce_volume is specified!"
            )

    def handle_connection_state_change(self, new_state: bool):
        """If the remote device just reconnected, remind it what settings it should have."""
        _LOGGER.debug("Connection state change")
        if new_state and self._attr_native_value is not None:
            self.send_volume(self._attr_native_value)

        self.available = new_state
        self.schedule_update_ha_state()

    def send_volume(self, vol):
        """Send the various media player settings to the remote."""
        if vol is not None:
            _LOGGER.info("Sending announce volume %f", vol)
            sm = proto.ServerMessage(
                set_player_volume=proto.MediaPlayerVolume(
                    player=proto.MediaPlayerId.ID_ANNOUNCE, volume=vol
                )
            )
            self._hassmic.connection_manager.send_enqueue(sm)


# vim: set ts=4 sw=4:
