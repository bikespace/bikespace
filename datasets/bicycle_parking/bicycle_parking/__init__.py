from dagster import (
    Definitions,
    load_assets_from_package_module,
    load_asset_checks_from_package_module,
)

from . import assets
from .resources.filesystem_io import LocalIOManager
from .resources.toronto_open_data import TorontoOpenDataResource
from .resources.openstreetmap import OpenStreetMapResource

all_assets = load_assets_from_package_module(assets)
all_asset_checks = load_asset_checks_from_package_module(assets)

defs = Definitions(
    assets=all_assets,
    asset_checks=all_asset_checks,
    resources={
        "io_manager": LocalIOManager(path_prefix=["data"]),
        "toronto_open_data": TorontoOpenDataResource(),
        "openstreetmap": OpenStreetMapResource(),
    },
)
