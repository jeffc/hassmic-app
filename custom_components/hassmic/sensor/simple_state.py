"""Defines the `simple_state` sensor"""

from __future__ import annotations

import logging

from homeassistant.components.assist_pipeline.pipeline import (
    PipelineEvent,
    PipelineEventType,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from . import base

_LOGGER = logging.getLogger(__name__)


class SimpleState(base.SensorBase):
    """Defines the 'simple state' sensor, for use with view assist."""

    @property
    def hassmic_entity_name(self):
        return "simple_state"

    @property
    def icon(self):
        return "mdi:state-machine"

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry) -> None:
        super().__init__(hass, config_entry)

    def on_pipeline_event(self, event: PipelineEvent):
        """Handle a pipeline event."""

        def getSimpleState(t: PipelineEventType) -> str:
            """Convert a pipeline state into a simple string representation if it
            should change the sensor value.

            Return None if the sensor value shouldn't change.
            """
            match t:
                case PipelineEventType.ERROR:
                    return "error-error"
                case PipelineEventType.WAKE_WORD_START:
                    return "wake_word-listening"
                case PipelineEventType.STT_START:
                    return "stt-listening"
                case PipelineEventType.INTENT_START:
                    return "intent-processing"
                case PipelineEventType.TTS_START:
                    return "tts-generating"
                case PipelineEventType.TTS_END:
                    return "tts-speaking"
                case _:
                    return None

        s = getSimpleState(event.type)
        if s is not None:
            self._attr_native_value = s


# vim: set ts=4 sw=4:
