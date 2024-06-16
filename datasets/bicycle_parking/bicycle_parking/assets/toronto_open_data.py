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
import pandera as pa

from ..resources.toronto_open_data import TorontoOpenDataResource

gpd.options.io_engine = "pyogrio"

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
def validate_dataframe():
  gdf = gpd.read_file("data/street_furniture_bicycle_parking.geojson")
  schema = pa.DataFrameSchema(
    {
      "ID": pa.Column(str), 
      "ADDRESSNUMBERTEXT": pa.Column(str), 
      "ADDRESSSTREET": pa.Column(str),  
      "FRONTINGSTREET": pa.Column(str), 
      "SIDE": pa.Column(str), 
      "FROMSTREET": pa.Column(str), 
      "DIRECTION": pa.Column(str), 
      "SITEID": pa.Column(str), 
      "WARD": pa.Column(str), 
      "BIA": pa.Column(str), 
      "ASSETTYPE": pa.Column(str), 
      "STATUS": pa.Column(str),
      "SDE_STATE_ID": pa.Column("int32"), 
      "geometry": pa.Column("geometry"),
    }
  )
  test = type(schema.validate(gdf)) == gpd.GeoDataFrame
  return AssetCheckResult(passed=bool(test))
