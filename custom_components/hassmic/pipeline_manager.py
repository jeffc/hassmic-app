"""Defines a class to manage the assist pipeline."""

import asyncio
import logging

from homeassistant.components import assist_pipeline, stt
from homeassistant.components.assist_pipeline.error import WakeWordDetectionError
from homeassistant.components.assist_pipeline.pipeline import (
    PipelineEventCallback,
    PipelineStage,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Context, HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntry

from .exceptions import *

_LOGGER = logging.getLogger(__name__)

# Maximum number of chunks in the queue before dumping
QUEUE_MAX_CHUNKS = 2048


class QueueAsyncIterable:
    """Wrapper around an asyncio queue that provides AsyncIterable[bytes].

    This also does some kind of gross hackery with asyncio because an `async
    for` doesn't respond to an asyncio.CancelledError being raised. This uses an
    event and a FIRST_COMPLETED `wait` to get around that. Inspiration from
    https://rob-blackbourn.medium.com/a-python-asyncio-cancellation-pattern-a808db861b84
    """

    def __init__(self, q: asyncio.Queue[bytes]):
        """Construct a new wrapper."""
        self._queue = q
        self._should_cancel = asyncio.Event()
        self._should_cancel_task = asyncio.create_task(self._should_cancel.wait())

    def close(self):
        _LOGGER.debug("Finishing asynciterable")
        self._should_cancel.set()

    def __aiter__(self):
        """Complete the asynciterator signature."""
        return self

    async def __anext__(self) -> bytes:
        """Return the next chunk."""
        if self._should_cancel.is_set():
            raise StopAsyncIteration

        try:
            done, pend = await asyncio.wait(
                [self._should_cancel_task, asyncio.create_task(self._queue.get())],
                return_when=asyncio.FIRST_COMPLETED,
            )

            for d in done:
                if d == self._should_cancel_task:
                    raise StopAsyncIteration

            # If we didn't find the should_cancel_task, it means that the queue
            # returned first
            for d in done:
                return d.result()
        except asyncio.CancelledError:
            self._should_cancel.set()
            raise StopAsyncIteration


class PipelineManager:
    """Manages the connection to the assist pipeline."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry,
        device: DeviceEntry,
        event_callback: PipelineEventCallback,
    ):
        """Construct a new manager."""
        self._hass: HomeAssistant = hass
        self._entry: ConfigEntry = entry
        self._device: DeviceEntry = device
        self._event_callback: PipelineEventCallback = event_callback
        self._queue: asyncio.Queue[bytes] = asyncio.Queue(QUEUE_MAX_CHUNKS)
        self._stream = QueueAsyncIterable(self._queue)
        self._should_close = False
        self._running = False
        self._task = None

    async def close(self):
        """Signal the run loop to finish."""
        self._should_close = True
        self._stream.close()
        _LOGGER.debug("Signaled pipeline_manager to close")
        if self._task:
            self._task.cancel()
            await self._task
            self._task = None
        self._running = False
        _LOGGER.debug("pipeline_manager closed ok")

    def run(self):
        """Start the loop."""
        if self._running:
            raise AlreadyRunningException("pipeline_manager already running")

        self._task = self._entry.async_create_background_task(
            self._hass, self._loop(), name="hassmic_pipeline"
        )

    async def _loop(self):
        """Run the managed pipeline."""

        _LOGGER.debug("Starting pipeline manager")

        self._running = True
        self._should_close = False
        while not self._should_close:
            try:
                await assist_pipeline.async_pipeline_from_audio_stream(
                    hass=self._hass,
                    context=Context(),
                    event_callback=self._event_callback,
                    stt_stream=self._stream,
                    stt_metadata=stt.SpeechMetadata(
                        language="",
                        format=stt.AudioFormats.WAV,
                        codec=stt.AudioCodecs.PCM,
                        bit_rate=stt.AudioBitRates.BITRATE_16,
                        sample_rate=stt.AudioSampleRates.SAMPLERATE_16000,
                        channel=stt.AudioChannels.CHANNEL_MONO,
                    ),
                    start_stage=PipelineStage.WAKE_WORD,
                    device_id=self._device.id,
                )

                _LOGGER.debug("Pipeline finished, starting over")
            except WakeWordDetectionError as e:
                if e.code == "wake-provider-missing":
                    _LOGGER.warning(
                        "Wakeword provider missing from pipeline.  Maybe not set up yet? Waiting and trying again."
                    )
                    await asyncio.sleep(1)
                else:
                    raise
            except asyncio.CancelledError:
                _LOGGER.debug("Pipeline manager thread cancelled, exiting")
                self._should_close = True
                break

            except Exception as e:
                _LOGGER.error("Got unhandled error: %s", str(e))

        self._running = False
        _LOGGER.debug("Pipeline manager exiting")

    def enqueue_chunk(self, chunk: bytes):
        """Enqueue an audio chunk, or clear the queue if it's full."""
        try:
            self._queue.put_nowait(chunk)
        except asyncio.QueueFull:
            _LOGGER.error("Chunk queue full, dumping contents")
            while True:
                try:
                    self._queue.get_nowait()
                except asyncio.QueueEmpty:
                    break


# vim: set ts=4 sw=4:
