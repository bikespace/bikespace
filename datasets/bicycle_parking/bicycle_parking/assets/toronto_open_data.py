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
    resource_id="282ec79d-983e-4b4a-a8b6-e67574a1c6dd",
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
def validate_df_sfbp():
  gdf = gpd.read_file("data/street_furniture_bicycle_parking.geojson")
  schema = pa.DataFrameSchema(
    {
      "_id": pa.Column("int32", required=False),
      "OBJECTID": pa.Column("int32", required=False),
      "ID": pa.Column(str), #required
      "ADDRESSNUMBERTEXT": pa.Column(str, nullable=True, required=False), 
      "ADDRESSSTREET": pa.Column(str, nullable=True, required=False),  
      "FRONTINGSTREET": pa.Column(str, nullable=True, required=False), 
      "SIDE": pa.Column(str, nullable=True, required=False), 
      "FROMSTREET": pa.Column(str, nullable=True, required=False), 
      "DIRECTION": pa.Column(str, nullable=True, required=False), 
      "SITEID": pa.Column(str, nullable=True, required=False), 
      "WARD": pa.Column(str, nullable=True), #required
      "BIA": pa.Column(str, nullable=True), #required
      "ASSETTYPE": pa.Column(str, nullable=True, 
        checks=pa.Check.isin(
          ['Ring', 'Rack', 'Art Stand', 'Shelter', 'Other', ''],
          ignore_na=True,
        ),
      ), #required
      "STATUS": pa.Column(str), #required
      "SDE_STATE_ID": pa.Column("int32", required=False), 
      "geometry": pa.Column("geometry"),
    },
    strict=True,
  )
  test = type(schema.validate(gdf)) == gpd.GeoDataFrame
  return AssetCheckResult(passed=bool(test))


@asset
def bicycle_parking_high_capacity_outdoor(
  context: AssetExecutionContext,
  toronto_open_data: TorontoOpenDataResource,
) -> MaterializeResult:
  gdf: gpd.GeoDataFrame
  metadata: dict
  gdf, metadata = toronto_open_data.request_gdf(
    dataset_name="bicycle-parking-high-capacity-outdoor",
    resource_id="9dd8ada5-109d-4ca7-a25a-d0fe234b6710",
  ).values()

  os.makedirs("data", exist_ok=True)
  with open("data/bicycle_parking_high_capacity_outdoor.geojson", "w") as f:
    f.write(gdf.to_json(na='drop', drop_id=True, indent=2))

  return MaterializeResult(metadata={
    "num_records": len(gdf),
    "last_updated": MetadataValue.timestamp(
      datetime.fromisoformat(metadata['last_modified'] + "+00:00")
    ),
    "preview": MetadataValue.md(gdf.head().to_markdown()),
    "crs": str(gdf.crs), 
  })

@asset_check(asset=bicycle_parking_high_capacity_outdoor)
def validate_df_bphco():
  gdf = gpd.read_file("data/bicycle_parking_high_capacity_outdoor.geojson")
  schema = pa.DataFrameSchema(
    {
      "ADDRESS_POINT_ID": pa.Column("int32"),
      "ADDRESS_NUMBER": pa.Column(str),
      "LINEAR_NAME_FULL": pa.Column(str),
      "ADDRESS_FULL": pa.Column(str),
      "POSTAL_CODE": pa.Column(str, nullable=True),
      "MUNICIPALITY": pa.Column(str),
      "CITY": pa.Column(str),
      "WARD": pa.Column(str),
      "PLACE_NAME": pa.Column(str, nullable=True),
      "GENERAL_USE_CODE": pa.Column("int32"),
      "CENTRELINE_ID": pa.Column("int32"),
      "LO_NUM": pa.Column("int32"),
      "LO_NUM_SUF": pa.Column(str, nullable=True),
      "HI_NUM": pa.Column("int32"),
      "LINEAR_NAME_ID": pa.Column("int32"),
      "ID": pa.Column("int32"),
      "PARKING_TYPE": pa.Column(str),
      "FLANKING": pa.Column(str, nullable=True),
      "BICYCLE_CAPACITY": pa.Column("int32"),
      "SIZE_M": pa.Column(str),
      "YEAR_INSTALLED": pa.Column("int32"),
      "BY_LAW": pa.Column(str),
      "DETAILS": pa.Column(str, nullable=True),
      "geometry": pa.Column("geometry"),
    }
  )
  test = type(schema.validate(gdf)) == gpd.GeoDataFrame
  return AssetCheckResult(passed=bool(test))


@asset
def bicycle_parking_racks(
  context: AssetExecutionContext,
  toronto_open_data: TorontoOpenDataResource,
) -> MaterializeResult:
  gdf: gpd.GeoDataFrame
  metadata: dict
  gdf, metadata = toronto_open_data.request_gdf(
    dataset_name="bicycle-parking-racks",
    resource_id="4d105465-6e64-4a69-957b-6e0eee5bca8b",
  ).values()

  os.makedirs("data", exist_ok=True)
  with open("data/bicycle_parking_racks.geojson", "w") as f:
    f.write(gdf.to_json(na='drop', drop_id=True, indent=2))

  return MaterializeResult(metadata={
    "num_records": len(gdf),
    "last_updated": MetadataValue.timestamp(
      datetime.fromisoformat(metadata['last_modified'] + "+00:00")
    ),
    "preview": MetadataValue.md(gdf.head().to_markdown()),
    "crs": str(gdf.crs), 
  })

@asset_check(asset=bicycle_parking_racks)
def validate_df_bpr():
  gdf = gpd.read_file("data/bicycle_parking_racks.geojson")
  schema = pa.DataFrameSchema(
    {
      "ADDRESS_POINT_ID": pa.Column("int32"),
      "ADDRESS_NUMBER": pa.Column(str),
      "LINEAR_NAME_FULL": pa.Column(str),
      "ADDRESS_FULL": pa.Column(str),
      "POSTAL_CODE": pa.Column(str),
      "MUNICIPALITY": pa.Column(str),
      "CITY": pa.Column(str),
      "CENTRELINE_ID": pa.Column("int32"),
      "LO_NUM": pa.Column("int32"),
      "LO_NUM_SUF": pa.Column(str),
      "HI_NUM": pa.Column("int32"),
      "HI_NUM_SUF": pa.Column(str),
      "LINEAR_NAME_ID": pa.Column("int32"),
      "WARD_NAME": pa.Column(str),
      "MI_PRINX": pa.Column("int32"),
      "OBJECTID": pa.Column("int32"),
      "CAPACITY": pa.Column("int32"),
      "MULTIMODAL": pa.Column(str),
      "SEASONAL": pa.Column(str),
      "SHELTERED": pa.Column(str),
      "SURFACE": pa.Column(str),
      "STATUS": pa.Column(str),
      "LOCATION": pa.Column(str),
      "NOTES": pa.Column(str),
      "MAP_CLASS": pa.Column(str),
      "geometry": pa.Column("geometry"),
    }
  )
  test = type(schema.validate(gdf)) == gpd.GeoDataFrame
  return AssetCheckResult(passed=bool(test))


@asset
def bicycle_parking_bike_stations_indoor(
  context: AssetExecutionContext,
  toronto_open_data: TorontoOpenDataResource,
) -> MaterializeResult:
  gdf: gpd.GeoDataFrame
  metadata: dict
  gdf, metadata = toronto_open_data.request_gdf(
    dataset_name="bicycle-parking-bike-stations-indoor",
    resource_id="c7829eee-131c-430d-a8de-a0b509b6d8f2",
  ).values()

  os.makedirs("data", exist_ok=True)
  with open("data/bicycle_parking_bike_stations_indoor.geojson", "w") as f:
    f.write(gdf.to_json(na='drop', drop_id=True, indent=2))

  return MaterializeResult(metadata={
    "num_records": len(gdf),
    "last_updated": MetadataValue.timestamp(
      datetime.fromisoformat(metadata['last_modified'] + "+00:00")
    ),
    "preview": MetadataValue.md(gdf.head().to_markdown()),
    "crs": str(gdf.crs), 
  })

@asset_check(asset=bicycle_parking_bike_stations_indoor)
def validate_df_bpbsi():
  gdf = gpd.read_file("data/bicycle_parking_bike_stations_indoor.geojson")
  schema = pa.DataFrameSchema(
    {
      "ADDRESS_POINT_ID": pa.Column("int32"),
      "ADDRESS_NUMBER": pa.Column(str),
      "LINEAR_NAME_FULL": pa.Column(str),
      "ADDRESS_FULL": pa.Column(str),
      "POSTAL_CODE": pa.Column(str, nullable=True),
      "MUNICIPALITY": pa.Column(str),
      "CITY": pa.Column(str),
      "WARD_NAME": pa.Column(str),
      "PLACE_NAME": pa.Column(str, nullable=True),
      "GENERAL_USE_CODE": pa.Column("int32"),
      "CENTRELINE_ID": pa.Column("int32"),
      "LO_NUM": pa.Column("int32"),
      "HI_NUM": pa.Column("int32"),
      "LINEAR_NAME_ID": pa.Column("int32"),
      "MI_PRINX": pa.Column("int32"),
      "ID": pa.Column("int32"),
      "STATION_TYPE": pa.Column(str),
      "TRANSIT_STATION": pa.Column(str),
      "FLANKING": pa.Column(str),
      "BIKE_CAPACITY": pa.Column("int32"),
      "CHANGE_ROOM": pa.Column(str),
      "VENDING_MACHINE": pa.Column(str),
      "TOOLS_PUMP": pa.Column(str),
      "YR_INSTALL": pa.Column("int32"),
      "geometry": pa.Column("geometry"),
    }
  )
  test = type(schema.validate(gdf)) == gpd.GeoDataFrame
  return AssetCheckResult(passed=bool(test))