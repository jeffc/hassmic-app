"""Config flow for hassmic integration."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.components import zeroconf
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers import selector

from .const import DOMAIN
from .hassmic import HassMic

_LOGGER = logging.getLogger(__name__)

# Required fields
CONFIG_SCHEMA = vol.Schema(
    {
        vol.Required("name"): selector.TextSelector(),
        vol.Required("hostname"): str,
        vol.Required("port", default=11700): vol.All(int, vol.Range(min=1, max=65535)),
    }
)

# Optional settings to change
OPTIONS_SCHEMA = vol.Schema({}).extend(CONFIG_SCHEMA.schema)


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Config flow for hassmic."""

    VERSION = 1
    MINOR_VERSION = 1

    async def async_step_user(self, user_input=None):
        """User step."""
        errors = []
        if user_input:
            name = user_input.get("name")
            hostname = user_input.get("hostname")
            port = user_input.get("port")
            try:
                self._uuid = await HassMic.async_validate_connection_params(
                    hostname, port
                )
                await self.async_set_unique_id(self._uuid, raise_on_progress=False)
                _LOGGER.debug("Got uuid from host: %s", self._uuid)
                if name and hostname and port:
                    return self.async_create_entry(
                        title=f"{name}",
                        data=user_input,
                    )

            except Exception as e:  # noqa: BLE001
                _LOGGER.error("Error: %s", str(e))
                errors.append(str(e))

        _LOGGER.debug("user_input=%s", repr(user_input))
        return self.async_show_form(
            step_id="user",
            data_schema=self.add_suggested_values_to_schema(CONFIG_SCHEMA, user_input),
            errors=errors,
        )

    async def async_step_zeroconf(self, discovery_info: zeroconf.ZeroconfServiceInfo):
        """Handle config flow initiated by zeroconf."""

        self._uuid = discovery_info.name.split(".")[0]
        self._host = str(discovery_info.ip_address)
        self._port = discovery_info.port
        _LOGGER.debug("matched zeroconf: '%s'", self._uuid)
        await self.async_set_unique_id(self._uuid)
        self._abort_if_unique_id_configured(
            updates={"hostname": self._host, "port": self._port}, reload_on_update=True
        )
        self.context["title_placeholders"] = {
            "name": f"hassmic @ {self._host}:{self._port}"
        }
        _LOGGER.debug("Found unregistered zeroconf: '%s'", self._uuid)
        _LOGGER.debug("Zeroconf info: '%s'", repr(discovery_info))
        return await self.async_step_discovery_confirm()

    async def async_step_discovery_confirm(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Confirm a discovered hassmic."""

        if user_input is None:
            return self.async_show_form(
                step_id="discovery_confirm",
                data_schema=self.add_suggested_values_to_schema(
                    CONFIG_SCHEMA,
                    {
                        "name": f"hassmic @ {self._host}",
                        "hostname": self._host,
                        "port": self._port,
                    },
                ),
            )
        return self.async_create_entry(
            title=user_input.get("name") or "hassmic",
            data=user_input,
        )


# vim: set ts=4 sw=4:
