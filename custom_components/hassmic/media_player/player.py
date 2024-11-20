"""Defines a hassmic media player"""

from __future__ import annotations

import logging
import betterproto

from homeassistant.components import media_source
from homeassistant.components.media_player import *
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .. import util
from ..proto import hassmic as proto

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
            | MediaPlayerEntityFeature.PAUSE
            | MediaPlayerEntityFeature.PLAY
            | MediaPlayerEntityFeature.PLAY_MEDIA
            | MediaPlayerEntityFeature.STOP
            | MediaPlayerEntityFeature.VOLUME_SET
            # | MediaPlayerEntityFeature.MEDIA_ENQUEUE
            # | MediaPlayerEntityFeature.NEXT_TRACK
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
            proto.ServerMessage(
                play_audio=proto.PlayAudio(
                    announce=announce,
                    url=media_id,
                )
            )
        )

    async def async_media_play(self):
        """Send a play command"""
        _LOGGER.info("Playing")
        self._hassmic.connection_manager.send_enqueue(
            proto.ServerMessage(
                command=proto.MediaPlayerCommand(
                    id=proto.MediaPlayerId.ID_PLAYBACK,
                    command=proto.MediaPlayerCommandId.COMMAND_PLAY,
                )
            )
        )

    async def async_media_pause(self):
        """Send a pause command"""
        _LOGGER.info("Pausing playback")
        self._hassmic.connection_manager.send_enqueue(
            proto.ServerMessage(
                command=proto.MediaPlayerCommand(
                    id=proto.MediaPlayerId.ID_PLAYBACK,
                    command=proto.MediaPlayerCommandId.COMMAND_PAUSE,
                )
            )
        )

    async def async_media_stop(self):
        """Send a stop command"""
        _LOGGER.info("Stopping playback")
        self._hassmic.connection_manager.send_enqueue(
            proto.ServerMessage(
                command=proto.MediaPlayerCommand(
                    id=proto.MediaPlayerId.ID_PLAYBACK,
                    command=proto.MediaPlayerCommandId.COMMAND_STOP,
                )
            )
        )

    def set_volume_level(self, volume: float) -> None:
        """Set the volume level."""
        if volume is None:
            _LOGGER.debug("Requested volume is None")
            return
        if not (0 <= volume and volume <= 1):
            raise ValueError(f"{volume} is not between 0 and 1")

        _LOGGER.info("Setting volume to %f", volume)
        sm = proto.ServerMessage(
            set_player_volume=proto.MediaPlayerVolume(
                player=proto.MediaPlayerId.ID_PLAYBACK, volume=volume
            )
        )
        self._hassmic.connection_manager.send_enqueue(sm)

    def handle_client_event(self, event: proto.ClientEvent):
        """Handle a client event."""
        (which, val) = betterproto.which_one_of(event, "event")

        match which:
            case "media_player_state_change":
                if val.player == proto.MediaPlayerId.ID_PLAYBACK:
                    match val.new_state:
                        case proto.MediaPlayerState.STATE_BUFFERING:
                            self._attr_state = MediaPlayerState.BUFFERING
                        case proto.MediaPlayerState.STATE_PLAYING:
                            self._attr_state = MediaPlayerState.PLAYING
                        case proto.MediaPlayerState.STATE_PAUSED:
                            self._attr_state = MediaPlayerState.PAUSED
                        case proto.MediaPlayerState.STATE_IDLE:
                            self._attr_state = MediaPlayerState.IDLE
                        case _:
                            _LOGGER.warning(
                                "Got unhandled media player state %s", val.new_state
                            )

            case "log":
                pass  # ignore logs here

            case "media_player_volume_change" | "device_volume_change":
                _LOGGER.debug("Got %s, ignoring it", which)

            case _:
                _LOGGER.warning("Got unhandled client event type %s", which)

        self.schedule_update_ha_state()

    def handle_connection_state_change(self, new_state: bool):
        """If the remote device just reconnected, remind it what settings it should have."""
        _LOGGER.debug("Connection state change")
        if new_state:
            self.send_config()

        self.available = new_state
        self.schedule_update_ha_state()

    def send_config(self):
        """Send the various media player settings to the remote."""

        if self._attr_volume_level is not None:
            _LOGGER.debug("send volume: %s", self._attr_volume_level)
            self.set_volume_level(self._attr_volume_level)
