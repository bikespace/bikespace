from dagster import Definitions, load_assets_from_modules

from . import assets
from .assets import validate_dataframe
from .resources.toronto_open_data import TorontoOpenDataResource

all_assets = load_assets_from_modules([assets])

defs = Definitions(
    assets=all_assets,
    asset_checks=[validate_dataframe],
    resources={
      "toronto_open_data": TorontoOpenDataResource(),
    },
)
