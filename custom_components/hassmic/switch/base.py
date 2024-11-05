"""Provides the base class for hassmic switches."""

from __future__ import annotations

import logging

from homeassistant.components.assist_pipeline.pipeline import PipelineEvent
from homeassistant.components.switch import (
    ENTITY_ID_FORMAT,
    SwitchDeviceClass,
    SwitchEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .. import util

_LOGGER = logging.getLogger(__name__)


class SwitchBase(SwitchEntity):
    """A generic hassmic Switch.

    All switches should inherit from this class.

    """

    _attr_is_on = False
    _attr_should_poll = False
    _attr_device_class = SwitchDeviceClass.SWITCH

    @property
    def hassmic_entity_name(self):
        raise NotImplementedError(
            f"Class {type(self).__name__} has no hassmic_entity_name"
        )

    @property
    def icon(self):
        return "mdi:toggle-switch"

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry) -> None:
        """Initialize hassmic switch."""
        super().__init__()
        util.InitializeEntity(self, ENTITY_ID_FORMAT, hass, config_entry)

    def handle_connection_state_change(self, new_state: bool):
        """Handle a connection state change."""
        self.available = new_state
        self.schedule_update_ha_state()

    def on_pipeline_event(self, event: PipelineEvent):
        """This method gets overridden to handle pipeline events for switches."""

    def handle_pipeline_event(self, event: PipelineEvent):
        """Handle a `PipelineEvent` by calling on_pipeline_event()."""

        # if we're not connected (switch is unavailable), ignore pipeline state
        # updates
        if not self.available:
            return

        self.on_pipeline_event(event)
        self.schedule_update_ha_state()
        return
