"""Provides the base class for hassmic sensors."""

from __future__ import annotations

import logging

from homeassistant.components.assist_pipeline.pipeline import (
    PipelineEvent,
    PipelineEventType,
)
from homeassistant.components.sensor import ENTITY_ID_FORMAT, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_IDLE
from homeassistant.core import HomeAssistant

from .. import util
from ..const import STATE_ERROR

_LOGGER = logging.getLogger(__name__)


class SensorBase(SensorEntity):
    """A generic hassmic Sensor.

    All sensors should inherit from this class.
    """

    _attr_native_value = STATE_IDLE
    _attr_should_poll = False

    @property
    def hassmic_entity_name(self):
        raise NotImplementedError(
            f"Class {type(self).__name__} has no hassmic_entity_name"
        )

    @property
    def icon(self):
        return "mdi:help"

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry) -> None:
        """Initialize hassmic Sensor."""
        super().__init__()
        util.InitializeEntity(self, ENTITY_ID_FORMAT, hass, config_entry)

    def handle_connection_state_change(self, new_state: bool):
        """Handle a connection state change."""
        self.available = new_state
        self.schedule_update_ha_state()

    def on_pipeline_event(self, event: PipelineEvent):
        """This method gets overridden to handle pipeline events for sensors."""

    def handle_pipeline_event(self, event: PipelineEvent):
        """Handle a `PipelineEvent` by calling on_pipeline_event()."""

        # if we're not connected (sensor is unavailable), ignore pipeline state
        # updates
        if not self.available:
            return

        # If we encountered an error, set all sensors to error
        if event.type == PipelineEventType.ERROR:
            if event.data.get("code", None) != "wake-word-timeout":
                self._attr_native_value = STATE_ERROR

        # TODO - figure out what the best thing to do with run_start and
        # run_end is.

        self.on_pipeline_event(event)
        self.schedule_update_ha_state()
        return


# vim: set ts=4 sw=4:
