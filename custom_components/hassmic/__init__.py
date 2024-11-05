"""The hassmic integration."""

from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry
from homeassistant.helpers.entity import DeviceInfo, Entity

from . import const
from .hassmic import HassMic

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up hassmic from a config entry."""

    dr = device_registry.async_get(hass)

    device = dr.async_get_or_create(
        config_entry_id=entry.entry_id,
        name=entry.title,
        identifiers={(const.DOMAIN, entry.unique_id)},
    )
    _LOGGER.debug("Device id: %s", device.id)
    # Create a HassMic instance and keep it in the runtime_data of the
    # ConfigEntry, so it can be accessed from anywhere in the entry.

    entry.runtime_data = HassMic(hass, entry, device)

    # TODO Optionally validate config entry options before setting up platform

    await hass.config_entries.async_forward_entry_setups(entry, const.PLATFORMS)

    entry.async_on_unload(entry.add_update_listener(config_entry_update_listener))
    entry.async_on_unload(entry.runtime_data.stop)

    return True


async def config_entry_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Update listener, called when the config entry options are changed."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""

    _LOGGER.debug("Stopping the hassmic")
    # await entry.runtime_data.stop()
    # _LOGGER.debug("Hassmic stop ok, waiting on unload_platforms")
    ok = await hass.config_entries.async_unload_platforms(entry, const.PLATFORMS)
    _LOGGER.debug("Unload platforms: %s", str(ok))
    _LOGGER.debug("Unloaded hassmic")
    return ok
