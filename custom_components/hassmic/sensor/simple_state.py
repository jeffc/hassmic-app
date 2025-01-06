"""Defines the `simple_state` sensor"""

from __future__ import annotations

import logging
import asyncio
import io

from homeassistant.components.assist_pipeline.pipeline import (
    PipelineEvent,
    PipelineEventType,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from mutagen.mp3 import MP3
from homeassistant.helpers.network import get_url
from homeassistant.helpers.aiohttp_client import async_get_clientsession
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

    async def get_tts_duration(self, hass: HomeAssistant, tts_url: str) -> float:
        try:
            if tts_url.startswith('/'):
                base_url = get_url(hass)
                full_url = f"{base_url}{tts_url}"
            else:
                full_url = tts_url

            session = async_get_clientsession(hass)
            async with session.get(full_url) as response:
                if response.status != 200:
                    _LOGGER.error(f"Failed to fetch TTS audio: HTTP {response.status}")
                    return 0

                content = await response.read()

            audio = MP3(io.BytesIO(content))
            return audio.info.length
        except Exception as e:
            _LOGGER.error(f"Error getting TTS duration: {e}")
            return 0

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
                    # Get the TTS URL and events to pass them to _handle_tts_end
                    tts = event.data["tts_output"]
                    tts_url = tts["url"]
                    events = event.data.get("events", {})

                    # Call _handle_tts_end to get the duration and trigger the popup
                    asyncio.create_task(self._handle_tts_end(tts_url, events))  # Call service to handle TTS end
                    return "tts-speaking"
                case _:
                    return None

        s = getSimpleState(event.type)
        if s is not None:
            self._attr_native_value = s

    async def _handle_tts_end(self, tts_url: str, events: dict):
        try:
            duration = await self.get_tts_duration(self.hass, tts_url)

            if events and PipelineEventType.TTS_END in events:
                events[PipelineEventType.TTS_END]["data"]["tts_duration"] = duration
            _LOGGER.debug(f"Stored TTS duration: {duration} seconds")
            await asyncio.sleep(duration)  # Small additional delay
            self._attr_native_value = "tts-finished"
            self.async_write_ha_state()
        except Exception as e:
            _LOGGER.error(f"Error in _handle_tts_end: {e}")

# vim: set ts=4 sw=4:
