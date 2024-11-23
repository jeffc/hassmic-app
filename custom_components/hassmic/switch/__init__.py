"""Switch platform for hassmic integration."""

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .microphone import Microphone

_LOGGER = logging.getLogger(__name__)

# All of the sensor types in hassmic
ALL_SWITCH_TYPES = [
    Microphone,
]


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Initialize hassmic config entry for switches."""

    async_add_entities(
        [switch_type(hass, config_entry) for switch_type in ALL_SWITCH_TYPES]
    )


# vim: set ts=4 sw=4:
