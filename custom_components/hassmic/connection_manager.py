"""Manages the network connection for an entry (device)."""

import asyncio
import contextlib
import base64
import json
import logging
import time

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .exceptions import BadMessageException
from .proto.hassmic import *

_LOGGER = logging.getLogger(__name__)

# How many bad messages in a row should cause us to drop the connection and
# reconnect
MAX_CONSECUTIVE_BAD_MESSAGES = 5

# How long to wait until we assume the connection has died
TIMEOUT_SECS = 15


class ConnectionManager:
    """Manages a connection, including reconnects.

    Accepts a callback (`recv_fn`) which accepts a stream and reads messages
    from it.
    """

    def __init__(
        self,
        host: str,
        port: int,
        hass: HomeAssistant,
        config_entry: ConfigEntry,
        recv_fn,  # unclear how to type-hint this
        connection_state_callback,
    ) -> None:
        """Set up a new connection manager."""
        self._socket_reader = None
        self._socket_writer = None

        self._host = host
        self._port = port

        self._hass = hass
        self._config_entry = config_entry

        # track the time of the most recent message
        self._most_recent_message_timestamp = time.time()

        # set a callback that processes the connection
        self._recv_fn = recv_fn

        # set a callback when the connection state changes
        self._conn_state_callback = connection_state_callback

        # keep a queue of messages to send that can be written to synchronously
        self._outbox = asyncio.Queue()

        self.set_connection_state(False)
        self._should_close = False

        # Track the tasks we might start
        self._rec_loop_task = None
        self._send_loop_task = None
        self._watchdog_task = None

    def set_connection_state(self, s: bool):
        """Update the internal connection state."""
        self._is_connected = s
        if self._conn_state_callback and callable(self._conn_state_callback):
            self._conn_state_callback(s)

    async def reconnect(self) -> None:
        """Connect to the target, or reconnect a dropped connection."""
        if self._is_connected:
            _LOGGER.debug(
                "Already connected to %s:%d, reconnecting", self._host, self._port
            )
            await self.destroy_socket()

        try:
            _LOGGER.debug("Trying connection to %s:%d", self._host, self._port)
            self._socket_reader, self._socket_writer = await asyncio.open_connection(
                self._host, self._port
            )
            self.set_connection_state(True)
            _LOGGER.debug("Connected to %s:%d", self._host, self._port)
        except Exception as e:  # noqa: BLE001
            self.set_connection_state(False)
            _LOGGER.error(
                "Encountered an error trying to connect to %s:%d: %s",
                self._host,
                self._port,
                repr(e),
            )

    async def destroy_socket(self):
        """Actually kills the connection.

        Outside callers should call close() instead.
        """
        _LOGGER.debug("Called destroy_socket()")
        self.set_connection_state(False)
        if self._socket_writer is None:
            # no socket to destroy
            _LOGGER.debug("No socket to destory")
            return

        if not self._socket_writer.is_closing():
            _LOGGER.debug("Requesting socket close")
            self._socket_writer.close()  # writer controls the underlying socket

        # ignore connection errors when we're trying to close the connection
        # anyways
        with contextlib.suppress(ConnectionError):
            _LOGGER.debug("Waiting for socket close")
            await self._socket_writer.wait_closed()

        _LOGGER.debug("Socket closed ok")

    async def close(self):
        """Request close of this conn manager."""
        _LOGGER.debug("Closing conn manager")
        self._should_close = True
        self._task.cancel()
        await self._task

        _LOGGER.debug("Stopped tasks, closing socket")

        # ignore connection errors when we're trying to close the connection
        # anyways
        with contextlib.suppress(ConnectionError):
            if self._socket_writer:
                await self._socket_writer.wait_closed()

        _LOGGER.debug("Conn manager closed ok")

    async def _ping_watchdog(self):
        """Run a continuous check that the connection isn't dead."""

        _LOGGER.debug("Starting ping watchdog")
        while self._is_connected and not self._should_close:
            # give messages a chance to come in
            await asyncio.sleep(TIMEOUT_SECS)
            now = time.time()
            diff = int(now - self._most_recent_message_timestamp)
            if diff > TIMEOUT_SECS:
                _LOGGER.warning(
                    "Last message from %s is %d seconds old. "
                    "Assuming connection is dead",
                    self._host,
                    diff,
                )
                self.set_connection_state(False)
                _LOGGER.debug("Leaving ping watchdog")
            await asyncio.sleep(1)
        _LOGGER.debug("Stopping ping watchdog")

    async def send(self, data: ServerMessage):
        """Send some data over the socket, if connected."""
        if self._socket_writer:
            binmsg = bytes(data)
            _LOGGER.debug(f"Sending object: {binmsg}")
            b64msg = base64.b64encode(binmsg).decode("ascii")
            _LOGGER.debug(f"Sending bytes: {b64msg}")
            self._socket_writer.write((b64msg + "\n").encode())
            await self._socket_writer.drain()
        else:
            _LOGGER.warning("Tried to write data to dead socket")

    def send_enqueue(self, data: ServerMessage):
        """Enqueue data to be sent synchronously."""
        self._outbox.put_nowait(data)

    def run(self):
        self._task = self._config_entry.async_create_background_task(
            self._hass, self._loop(), name="hassmic_connection"
        )

    async def _rec_loop(self):
        try:
            is_eof = False
            bad_messages = 0  # track consecutive bad messages
            while self._is_connected and not is_eof and not self._should_close:
                try:
                    # If we wait for more than two seconds, cancel the
                    # attempt and try again. This means that we'll
                    # reevaluate should_close
                    msg = await asyncio.wait_for(
                        self._recv_fn(self._socket_reader), timeout=2.0
                    )
                    if msg is None:
                        _LOGGER.debug("Got EOF")
                        is_eof = True
                        self.set_connection_state(False)
                    self._most_recent_message_timestamp = time.time()
                except BadMessageException as e:
                    _LOGGER.error(repr(e))
                    bad_messages += 1
                    if bad_messages >= MAX_CONSECUTIVE_BAD_MESSAGES:
                        _LOGGER.error(
                            "Reached threshold for consecutive bad messages; reconnecting"
                        )
                        await self.reconnect()
                        bad_messages = 0
                    continue
                except TimeoutError:
                    continue

                bad_messages = 0
        except ConnectionResetError:
            _LOGGER.warning("Connection to %s:%d lost", self._host, self._port)
        except asyncio.CancelledError:
            _LOGGER.debug("Rec loop got cancellation, cleaning up")
        except Exception as e:  # noqa: BLE001
            _LOGGER.error("Unexpected exception: %s", repr(e))
        finally:
            _LOGGER.debug("Exited rec loop")

    async def _send_loop(self):
        """Loop over messages in the outbox and send them."""
        try:
            while self._is_connected and not self._should_close:
                d = await self._outbox.get()
                _LOGGER.debug("Sending from queue: `%s`", str(d))
                await self.send(d)
        except asyncio.CancelledError:
            _LOGGER.debug("Send task got cancellation; cleaning up")
        finally:
            _LOGGER.debug("Exited send loop")

    async def _loop(self):
        """Run the network management loop."""
        _LOGGER.info("Starting network tasks for %s:%d", self._host, self._port)
        try:
            while not self._should_close:
                await self.reconnect()
                self._rec_loop_task = self._config_entry.async_create_background_task(
                    self._hass, self._rec_loop(), "hassmic_rec_loop"
                )
                self._send_loop_task = self._config_entry.async_create_background_task(
                    self._hass, self._send_loop(), "hassmic_send_loop"
                )
                self._watchdog_task = self._config_entry.async_create_background_task(
                    self._hass, self._ping_watchdog(), "hassmic_watchdog"
                )
                _LOGGER.debug("Created watchdog task")

                while self._is_connected and not self._should_close:
                    await asyncio.sleep(1)

                if self._should_close:
                    _LOGGER.info("Disconnected from %s:%d", self._host, self._port)
                else:
                    _LOGGER.warning(
                        "Disconnected from %s:%d; will reconnect",
                        self._host,
                        self._port,
                    )
                await asyncio.sleep(1)

            _LOGGER.info("Shutting down connection to %s:%d", self._host, self._port)
        except asyncio.CancelledError:
            _LOGGER.debug("Connection manager main loop caught cancel signal")

        self._rec_loop_task.cancel()
        self._send_loop_task.cancel()
        self._watchdog_task.cancel()

        await self.destroy_socket()
