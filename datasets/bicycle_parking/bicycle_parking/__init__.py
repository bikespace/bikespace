from dagster import Definitions, load_assets_from_modules

from . import assets
from .assets import necessary_columns_exist
from .resources.toronto_open_data import TorontoOpenDataResource

all_assets = load_assets_from_modules([assets])

defs = Definitions(
    assets=all_assets,
    asset_checks=[necessary_columns_exist],
    resources={
      "toronto_open_data": TorontoOpenDataResource(),
    },
)
