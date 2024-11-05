"""Main class for hassmic."""

import asyncio
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

MAX_CHUNK_SIZE = 8192
MAX_JSON_SIZE = 1024

EXTRA_MSG_TIMEOUT_SECS = 0.5

MESSAGE_TYPE_AUDIO_CHUNK = "audio-chunk"

_LOGGER = logging.getLogger(__name__)


class MessageType(enum.Enum):
    """The list of possible message types."""

    UNKNOWN = None
    AUDIO_CHUNK = "audio-chunk"
    CLIENT_INFO = "client-info"
    PING = "ping"


class Message:
    """Defines a message type for the "Cheyenne" protocol."""

    def __init__(self, **kwargs):
        """Create a new Message with the given params."""
        self.message_type = MessageType.UNKNOWN

        with contextlib.suppress(ValueError):
            self.message_type = MessageType(kwargs.get("message_type", None))

        self.data = kwargs.get("data", {})
        self.payload = kwargs.get("payload", b"")

    def __repr__(self):
        """Stringify the message."""
        return (
            f"Message ({self.message_type.name}): "
            f"{self.data!r} "
            f"(payload {len(self.payload)} bytes)"
        )


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
                if m.message_type == MessageType.CLIENT_INFO:
                    if (uuid := m.data.get("uuid")) is not None:
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
                        "type": "play-tts",
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

    async def handle_incoming_message(self, reader) -> Message:
        """Wrap recv_message and dispatches recieved messages appropriately."""

        m = await HassMic.recv_message(reader)
        if m is None:
            return None

        match m.message_type:
            case MessageType.UNKNOWN:
                _LOGGER.warning(
                    "Got an unknown message from " "%s:%d. Ignoring it.",
                    self._host,
                    self._port,
                )

            case MessageType.AUDIO_CHUNK:
                # handle audio data
                # rate = m.data.get("rate")
                # width = m.data.get("width")
                # channels = m.data.get("channels")
                self._pipeline_manager.enqueue_chunk(m.payload)

            case MessageType.CLIENT_INFO:
                _LOGGER.debug("Got client info: %s", repr(m.data))

            case MessageType.PING:
                pass

            case _:
                _LOGGER.error(
                    "Got unhandled (but known) message type %s", m.message_type.name
                )

        return m

    @staticmethod
    async def recv_message(reader) -> Message:
        """Read a message from the stream, or None if the stream is closed."""

        recv = await reader.readline()
        while recv == b"\n":  # skip blank lines if we're expecting JSON
            recv = await reader.readline()

        if recv == b"":
            return None

        msg = {}
        try:
            msg = json.loads(recv.decode("utf-8"))
        except UnicodeError as err:
            raise BadMessageException("Couldn't decode message") from err
        except json.JSONDecodeError as err:
            raise BadMessageException("Failed to decode JSON: '%s'", recv) from err

        if "type" not in msg:
            raise BadMessageException("Field 'type' not in msg: '%s'", msg)

        payload_bytes = b""

        if msg.get("data") is None:
            msg["data"] = {}

        if (data_length := msg.get("data_length", -1)) > 0:
            try:
                async with asyncio.timeout(EXTRA_MSG_TIMEOUT_SECS):
                    extra_data = await reader.readexactly(data_length)
                    try:
                        d = json.loads(extra_data.decode("utf-8"))
                        msg["data"] |= d
                    except UnicodeError as err:
                        raise BadMessageException(
                            "Couldn't decode extra data message"
                        ) from err
                    except json.JSONDecodeError as err:
                        raise BadMessageException(
                            "Failed to decode JSON for extra data: '%s'", msg
                        ) from err
            except TimeoutError as err:
                raise BadMessageException("Timed out waiting for extra data") from err

        if (payload_length := msg.get("payload_length", -1)) > 0:
            try:
                async with asyncio.timeout(EXTRA_MSG_TIMEOUT_SECS):
                    payload_bytes = await reader.readexactly(payload_length)
            except TimeoutError as err:
                raise BadMessageException("Timed out waiting for payload") from err

        return Message(
            message_type=msg["type"],
            data=msg["data"],
            payload=payload_bytes,
        )
