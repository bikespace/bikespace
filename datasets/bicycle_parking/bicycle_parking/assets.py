import os
import json
from datetime import datetime, timezone

from dagster import (
  asset, 
  AssetExecutionContext, 
  MaterializeResult, 
  MetadataValue
)
import geopandas as gpd
import pandas as pd

from .resources.toronto_open_data import TorontoOpenDataResource

@asset
def street_furniture_bicycle_parking(
  context: AssetExecutionContext,
  toronto_open_data: TorontoOpenDataResource,
) -> MaterializeResult:
  response, metadata = toronto_open_data.request(
    dataset_name="street-furniture-bicycle-parking",
    resource_name="282ec79d-983e-4b4a-a8b6-e67574a1c6dd",
  ).values()

  data_raw = response.json()

  os.makedirs("data", exist_ok=True)
  with open("data/street_furniture_bicycle_parking.json", "w") as f:
    json.dump(data_raw, f)
  
  return MaterializeResult(metadata={
    "num_records": len(data_raw['features']),
    "last_updated": MetadataValue.timestamp(
      datetime.fromisoformat(metadata['last_modified'] + "+00:00")
    ),
  })