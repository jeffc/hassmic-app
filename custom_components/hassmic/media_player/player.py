"""Defines a hassmic media player"""

from __future__ import annotations

import logging

from homeassistant.components import media_source
from homeassistant.components.media_player import *
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .. import util

_LOGGER = logging.getLogger(__name__)


class Player(MediaPlayerEntity):
    """Represents a hassmic media player."""

    @property
    def entity_description(self) -> MediaPlayerEntityDescription:
        mped = MediaPlayerEntityDescription(key=self.unique_id)
        mped.device_class = MediaPlayerDeviceClass.SPEAKER

    def __init__(
        self, hass: HomeAssistant, config_entry: ConfigEntry, entity_name="media_player"
    ) -> None:
        """Initialize hassmic Sensor."""
        super().__init__()
        self.hassmic_entity_name = entity_name
        util.InitializeEntity(self, ENTITY_ID_FORMAT, hass, config_entry)

        self._hass = hass
        self._config_entry = config_entry
        self._hassmic = config_entry.runtime_data

        self._attr_state = MediaPlayerState.IDLE
        self._attr_supported_features = (
            MediaPlayerEntityFeature(0)
            | MediaPlayerEntityFeature.MEDIA_ANNOUNCE
            # | MediaPlayerEntityFeature.MEDIA_ENQUEUE
            # | MediaPlayerEntityFeature.NEXT_TRACK
            | MediaPlayerEntityFeature.PAUSE
            | MediaPlayerEntityFeature.PLAY
            | MediaPlayerEntityFeature.PLAY_MEDIA
            | MediaPlayerEntityFeature.STOP
            # | MediaPlayerEntityFeature.VOLUME_MUTE
            # | MediaPlayerEntityFeature.VOLUME_SET
        )

    async def async_play_media(
        self,
        media_type: str,
        media_id: str,
        enqueue: MediaPlayerEnqueue | None = None,
        announce: bool | None = None,
        **kwargs: Any,
    ):
        """Play a piece of media."""

        # resolve a media_source_id into a URL
        # https://developers.home-assistant.io/docs/core/entity/media-player/#play-media
        if media_source.is_media_source_id(media_id):
            play_item = await media_source.async_resolve_media(
                self.hass, media_id, self.entity_id
            )
            media_id = async_process_play_media_url(self.hass, play_item.url)

        _LOGGER.info("Playing media: '%s'", media_id)
        self._hassmic.connection_manager.send_enqueue(
            {
                "type": ("play-announce" if announce else "play-audio"),
                "data": {
                    "url": media_id,
                },
            }
        )
