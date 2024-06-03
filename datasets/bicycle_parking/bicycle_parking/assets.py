import os
import json
from datetime import datetime, timezone

from dagster import (
  asset, 
  asset_check,
  AssetCheckResult,
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
  gdf: gpd.GeoDataFrame
  metadata: dict
  gdf, metadata = toronto_open_data.request_gdf(
    dataset_name="street-furniture-bicycle-parking",
    resource_name="282ec79d-983e-4b4a-a8b6-e67574a1c6dd",
  ).values()

  os.makedirs("data", exist_ok=True)
  with open("data/street_furniture_bicycle_parking.geojson", "w") as f:
    f.write(gdf.to_json(na='drop', drop_id=True, indent=2))

  return MaterializeResult(metadata={
    "num_records": len(gdf),
    "last_updated": MetadataValue.timestamp(
      datetime.fromisoformat(metadata['last_modified'] + "+00:00")
    ),
    "preview": MetadataValue.md(gdf.head().to_markdown()),
    "crs": str(gdf.crs), 
  })

@asset_check(asset=street_furniture_bicycle_parking)
def necessary_columns_exist():
  gdf = gpd.read_file("data/street_furniture_bicycle_parking.geojson")
  test = pd.Series([
    'ID', 
    'ADDRESSNUMBERTEXT', 
    'ADDRESSSTREET',  
    'FRONTINGSTREET', 
    'SIDE', 
    'FROMSTREET', 
    'DIRECTION', 
    'SITEID', 
    'WARD', 
    'BIA', 
    'ASSETTYPE', 
    'STATUS', 
    'SDE_STATE_ID', 
    'geometry'
  ]).isin(gdf.columns).all()
  return AssetCheckResult(passed=bool(test))
