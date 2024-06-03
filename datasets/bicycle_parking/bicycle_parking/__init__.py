from dagster import Definitions, load_assets_from_modules

from . import assets
from .resources.toronto_open_data import TorontoOpenDataResource

all_assets = load_assets_from_modules([assets])

defs = Definitions(
    assets=all_assets,
    resources={
      "toronto_open_data": TorontoOpenDataResource(),
    },
)
