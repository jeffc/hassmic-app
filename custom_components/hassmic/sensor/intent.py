"""Defines the `intent` sensor"""

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


class Intent(base.SensorBase):
    """Defines a sensor with the full pipeline state."""

    @property
    def hassmic_entity_name(self):
        return "intent"

    @property
    def icon(self):
        return "mdi:brain"

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry) -> None:
        super().__init__(hass, config_entry)

    def on_pipeline_event(self, event: PipelineEvent):
        """Handle a pipeline event."""
        if event.type == PipelineEventType.INTENT_END:
            iout = event.data.get("intent_output", None)
            if iout is None:
                _LOGGER.warning("Got no intent_output data from INTENT_END event")
                return
            response = iout.get("response", None)
            conversation_id = iout.get("conversation_id", None)
            resp = {}
            if response:
                resp["response_type"] = response.get("response_type", None)
                resp["response_data"] = response.get("data", None)
                resp["speech"] = response.get("speech", None)

            # speech type can be one of "plain" (default) or "ssml"
            speech = ""
            speech_type = None
            if s := resp.get("speech"):
                if ps := s.get("plain", None):
                    speech = ps.get("speech", None)
                    speech_type = "plain"
                elif ssml := s.get("ssml", None):
                    speech = ssml.get("speech", None)
                    speech_type = "ssml"

            if not speech or not speech_type:
                _LOGGER.warning("No speech found in intent output")

            self._attr_native_value = (
                speech if len(speech) <= 255 else (speech[:252] + "...").strip()
            )
            self._attr_extra_state_attributes = {
                **event.data,
                "speech_output": speech,
            }
