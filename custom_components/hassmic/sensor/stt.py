"""Defines the `stt` sensor"""

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


class STT(base.SensorBase):
    """Defines a sensor with the STT state."""

    @property
    def hassmic_entity_name(self):
        return "stt"

    @property
    def icon(self):
        return "mdi:ear-hearing"

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry) -> None:
        super().__init__(hass, config_entry)

    def on_pipeline_event(self, event: PipelineEvent):
        """Handle a pipeline event."""

        if event.type == PipelineEventType.STT_END:
            stt_out = event.data.get("stt_output", None)
            if stt_out:
                txt = stt_out.get("text", None)
                self._attr_native_value = (
                    txt if len(txt) <= 255 else (txt[:252] + "...").strip()
                )
                self._attr_extra_state_attributes = {
                    "speech": txt,
                }
