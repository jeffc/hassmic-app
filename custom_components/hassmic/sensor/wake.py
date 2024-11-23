"""Defines the `wake` sensor"""

from __future__ import annotations

import logging

from homeassistant.components.assist_pipeline.pipeline import (
    PipelineEvent,
    PipelineEventType,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from ..const import STATE_DETECTED, STATE_LISTENING
from . import base

_LOGGER = logging.getLogger(__name__)


class Wake(base.SensorBase):
    """Defines a sensor with the wakeword state."""

    @property
    def hassmic_entity_name(self):
        return "wake"

    @property
    def icon(self):
        return "mdi:chat-alert-outline"

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry) -> None:
        super().__init__(hass, config_entry)

    def on_pipeline_event(self, event: PipelineEvent):
        """Handle a pipeline event."""

        # Wakeword start and end set the WAKE sensor
        match event.type:
            case PipelineEventType.WAKE_WORD_START:
                self._attr_native_value = STATE_LISTENING
                self._attr_extra_state_attributes = {
                    "entity_id": event.data.get("entity_id", None)
                }

            case PipelineEventType.WAKE_WORD_END:
                self._attr_native_value = STATE_DETECTED


# vim: set ts=4 sw=4:
