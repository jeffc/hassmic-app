"""Sensor platform for hassmic integration."""

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .intent import Intent
from .pipeline_state import PipelineState
from .simple_state import SimpleState
from .stt import STT
from .wake import Wake

_LOGGER = logging.getLogger(__name__)

# All of the sensor types in hassmic
ALL_SENSOR_TYPES = [
    Intent,
    PipelineState,
    SimpleState,
    STT,
    Wake,
]


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Initialize hassmic config entry for sensors."""

    async_add_entities(
        [sensor_type(hass, config_entry) for sensor_type in ALL_SENSOR_TYPES]
    )
