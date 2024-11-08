"""Main class for hassmic."""

import asyncio
import betterproto
import contextlib
import enum
import json
import logging

from homeassistant.components.assist_pipeline.pipeline import (
    PipelineEvent,
    PipelineEventType,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntry
from homeassistant.helpers.entity import Entity
from homeassistant.helpers.network import NoURLAvailableError, get_url

from .connection_manager import ConnectionManager
from .exceptions import BadHassMicClientInfoException, BadMessageException
from .pipeline_manager import PipelineManager

from .proto.hassmic import *

MAX_CHUNK_SIZE = 8192
MAX_JSON_SIZE = 1024

MSG_TIMEOUT_SECS = 0.5

_LOGGER = logging.getLogger(__name__)


class HassMic:
    """Handles interface between the HassMic app and home assistant."""

    @staticmethod
    async def async_validate_connection_params(host: str, port: int) -> str:
        """ "Validate the connection parameters and return the UUID of the host.

        Raise an exception if target is invalid.
        """

        _LOGGER.debug("Trying to validate connection to %s:%d", host, port)
        reader, writer = await asyncio.open_connection(host, port)
        try:
            async with asyncio.timeout(2):
                m = await HassMic.recv_message(reader)
                if (w := betterproto.which_one_of(m, "msg"))[0] == "clientInfo":
                    if (uuid := w[1].get("uuid")) is not None:
                        return uuid
                raise BadHassMicClientInfoException
        # Finally is executed regardless of result
        finally:
            writer.close()
            await writer.wait_closed()

    @property
    def connection_manager(self):
        return self._connection_manager

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry, device: DeviceEntry):
        """Initialize the instance."""

        self._hass = hass
        self._configentry = entry
        self._device = device

        self._host = entry.data.get("hostname")
        self._port = entry.data.get("port")

        # track the entities created alongside this hassmic
        self._entities = []

        self._connection_manager = ConnectionManager(
            host=self._host,
            port=self._port,
            hass=hass,
            config_entry=entry,
            recv_fn=self.handle_incoming_message,
            connection_state_callback=self._handle_connection_state_change,
        )

        self._pipeline_manager = PipelineManager(
            hass, entry, self._device, self._pipeline_event_callback
        )

        self._connection_manager.run()
        self._pipeline_manager.run()

    def register_entity(self, ent: Entity):
        """Add an entity to the list of entities generated for this hassmic."""
        self._entities.append(ent)

    def _pipeline_event_callback(self, event: PipelineEvent):
        """Update states in response to pipeline event.

        This function also handles dispatching the media URL.
        """
        _LOGGER.debug("Got pipeline event: %s", repr(event))

        if event.type is PipelineEventType.TTS_END and (
            o := event.data.get("tts_output")
        ):
            path = o.get("url")
            urlbase = None
            try:
                urlbase = get_url(self._hass)
            except NoURLAvailableError:
                _LOGGER.error(
                    "Failed to get a working URL for this Home Assistant "
                    "instance; can't send TTS URL to hassmic"
                )

            if path and urlbase:
                _LOGGER.debug("Play URL: '%s'", urlbase + path)
                self._connection_manager.send_enqueue(
                    {
                        "type": "play-audio",
                        "data": {
                            "url": urlbase + path,
                        },
                    }
                )
            else:
                _LOGGER.warning(
                    "Can't play TTS: (%s) or URL Base (%s) not found",
                    path,
                    urlbase,
                )

        for e in self._entities:
            hpe = getattr(e, "handle_pipeline_event", None)
            if hpe is not None and callable(hpe):
                e.handle_pipeline_event(event)

    def _handle_connection_state_change(self, new_state: bool):
        """Handle a state change from the connection manager."""
        _LOGGER.debug("Got connection change to state: %s", repr(new_state))
        for e in self._entities:
            hcsc = getattr(e, "handle_connection_state_change", None)
            if hcsc is not None and callable(hcsc):
                e.handle_connection_state_change(new_state)

    async def stop(self):
        """Shut down instance."""
        await asyncio.gather(
            self._connection_manager.close(), self._pipeline_manager.close()
        )

    async def handle_incoming_message(self, reader) -> ClientInfo:
        """Wrap recv_message and dispatches recieved messages appropriately."""

        m = await HassMic.recv_message(reader)
        if m is None:
            return None

        match m:
            case ClientMessage(audio_data=d):
                self._pipeline_manager.enqueue_chunk(d.data)

            case ClientMessage(client_info=value):
                _LOGGER.debug("Got client info: %s", repr(value))

            case ClientMessage(ping=_):
                pass

            case _:
                _LOGGER.warning(
                    "Got an unknown message from " "%s:%d. Ignoring it.",
                    self._host,
                    self._port,
                )

        return m

    @staticmethod
    async def recv_message(reader) -> ClientMessage:
        """Read a message from the stream, or None if the stream is closed.

        Messages are a size (32 bits) followed by a payload.
        """

        psb = await reader.read(4)
        if len(psb) != 4:
            raise BadMessageException(f"Expected 4 bytes of size data, got {len(psb)}")
        protosize = int.from_bytes(psb, "little")
        payload = None
        try:
            async with asyncio.timeout(MSG_TIMEOUT_SECS):
                payload = await reader.read(protosize)
        except TimeoutError as err:
            raise BadMessageException("Timed out waiting for proto data") from err

        try:
            msg = ClientMessage().parse(payload)
        except ValueError as err:
            raise BadMessageException(
                f"Got bad message trying to read proto of size {protosize}: {err}"
            ) from err

        return msg
