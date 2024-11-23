"""Contains utility functions that don't go anywhere else."""

import re

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo, Entity, generate_entity_id

from . import const


def InitializeEntity(
    e: Entity, entity_id_format: str, hass: HomeAssistant, config_entry: ConfigEntry
):
    unique_id = config_entry.unique_id
    if not hasattr(e, "hassmic_entity_name"):
        raise NotImplementedError(
            "Class '%s' doesn't have a 'hassmic_entity_name'" % type(e).__name__
        )

    e.unique_id = f"{unique_id}-{e.hassmic_entity_name}"
    e.name = config_entry.title + " " + e.hassmic_entity_name.replace("_", " ").title()

    e.device_info = DeviceInfo(
        identifiers={(const.DOMAIN, unique_id)},
    )

    id_candidate = re.sub(
        r"[^A-Za-z0-9_]",
        "_",
        f"{config_entry.title}_{e.hassmic_entity_name}".lower(),
    )
    e.entity_id = generate_entity_id(entity_id_format, id_candidate, hass=hass)
    config_entry.runtime_data.register_entity(e)


# vim: set ts=4 sw=4:
