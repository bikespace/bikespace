import os
import json
from datetime import datetime, timezone

from dagster import (
  asset, 
  asset_check,
  AssetCheckResult,
  AssetCheckSeverity,
  AssetKey,
  AssetExecutionContext, 
  MetadataValue,
  Output,
)
import geopandas as gpd
import pandas as pd
import pandera as pa

from .toronto_open_data_source import (
  street_furniture_bicycle_parking,
  bicycle_parking_high_capacity_outdoor,
  bicycle_parking_racks,
  bicycle_parking_bike_stations_indoor,
)
from ..resources.toronto_open_data import WARD_INFO


@asset(
  description="""Normalized to filter out bicycle parking objects which are not currently installed and with data converted to OpenStreetMap schema."""
)
def street_furniture_bicycle_parking_normalized(
  context: AssetExecutionContext,
  street_furniture_bicycle_parking,
) -> Output:
  gdf = street_furniture_bicycle_parking
  original_cols = gdf.columns.drop("geometry")
  previous = context.instance.get_latest_materialization_event(AssetKey("street_furniture_bicycle_parking")).asset_materialization

  # filter
  gdf_filtered = gdf[gdf['STATUS'] == "Existing"]

  # normalize
  def get_type(asset_type):
    parking_type = {
      'Ring': "bollard", 
      'Rack': "rack", 
      'Art Stand': "bollard", # three entries as of 2023-11 marked as "temporarily removed", appear to be bollards per Google Street View History
      'Shelter': "rack", # covered rack
      'Other': "stands", # two entries as of 2023-11, checked on Google Street View
    }
    return parking_type.get(asset_type, None)

  def get_capacity(asset_type):
    parking_capacity = {
      'Ring': 2, 
      'Rack': 5, # likely 5-8 in many cases, but unknown and may vary. 5 is a safe minimum estimate.
      'Art Stand': 2, # three entries as of 2023-11 marked as "temporarily removed", appear to be bollards per Google Street View History
      'Shelter': None, # covered rack - appears to vary
      'Other': 2, # two entries as of 2023-11, checked on Google Street View
    }
    return parking_capacity.get(asset_type, None)

  def get_covered(asset_type):
    return "yes" if asset_type == "Shelter" else "no"

  def get_ward_name(ward_number):
    lookup = WARD_INFO["street_furniture_bicycle_parking"]["lookup"]
    return lookup.get(ward_number, None)

  gdf_normalized = (
    gdf_filtered
    .assign(**{
      "amenity": "bicycle_parking",
      "bicycle_parking": gdf_filtered["ASSETTYPE"].apply(get_type),
      "capacity": gdf_filtered["ASSETTYPE"].apply(get_capacity),
      "operator": "City of Toronto",
      "covered": gdf_filtered["ASSETTYPE"].apply(get_covered),
      "access": "yes",
      "fee": "no",
      "ref:open.toronto.ca:street-furniture-bicycle-parking:id": gdf_filtered["ID"],
      "meta_status": gdf_filtered["STATUS"],
      "meta_business_improvement_area": gdf_filtered["BIA"],
      "meta_ward_name": gdf_filtered["WARD"].apply(get_ward_name),
      "meta_ward_number": gdf_filtered["WARD"],
      "meta_source_provider": "City of Toronto",
      "meta_source_dataset_name": "Street Furniture - Bicycle Parking",
      "meta_source_dataset_url": f"https://open.toronto.ca/dataset/street-furniture-bicycle-parking/",
      "meta_source_dataset_last_updated": datetime.fromtimestamp(
        previous.metadata["last_updated"].value,
        tz=timezone.utc,
        ).isoformat(),
    })
    .drop(original_cols, axis=1)
  )

  return Output(
    gdf_normalized,
    metadata={
      "num_records": len(gdf_normalized),
      "preview": MetadataValue.md(gdf_normalized.head().to_markdown()),
      "crs": str(gdf_normalized.crs), 
    },
  )


@asset(
  description="""Normalized with data converted to OpenStreetMap schema."""
)
def bicycle_parking_high_capacity_outdoor_normalized(
  context: AssetExecutionContext,
  bicycle_parking_high_capacity_outdoor,
) -> Output:
  gdf = bicycle_parking_high_capacity_outdoor
  original_cols = gdf.columns.drop("geometry")
  previous = context.instance.get_latest_materialization_event(AssetKey("bicycle_parking_high_capacity_outdoor")).asset_materialization

  def get_type(asset_type):
    parking_type = {
      "Bike Rack": "rack", 
      "Angled Bike Rack": "rack", 
      "Bike Corral": "rack", 
      "Bike Shelter": "rack"
    }
    return parking_type.get(asset_type, None)

  def is_covered(asset_type):
    covered_lookup = {
      "Bike Rack": "no", 
      "Angled Bike Rack": "no", 
      "Bike Corral": "no", 
      "Bike Shelter": "yes"
    }
    return covered_lookup.get(asset_type, None)
  
  def get_description(row):
    values = [
      ("Placement Street: " + row['FLANKING'] 
       if row["FLANKING"] != None else ""),
      ("Place Name: " + row['PLACE_NAME'] 
       if row["PLACE_NAME"] != None else ""),
      ("Details: " + row['DETAILS'] 
       if row["DETAILS"] != None else ""),
    ]
    return "\n\n".join(x.strip() for x in values if x.strip())
  
  def get_ward_number(ward_name):
    lookup = WARD_INFO["bicycle_parking_high_capacity_outdoor"]["lookup"]
    return lookup.get(ward_name, None)
  
  gdf_normalized = (
    gdf
    .assign(**{
      "amenity": "bicycle_parking",
      "bicycle_parking": gdf['PARKING_TYPE'].apply(get_type),
      "capacity": gdf['BICYCLE_CAPACITY'],
      "operator": "City of Toronto",
      "covered": gdf['PARKING_TYPE'].apply(is_covered),
      "access": "yes",
      "fee": "no",
      "start_date": gdf['YEAR_INSTALLED'],
      "length": gdf['SIZE_M'].astype(float),
      "description": gdf[["FLANKING", "PLACE_NAME", "DETAILS"]].apply(get_description, axis=1),
      "ref:open.toronto.ca:bicycle-parking-high-capacity-outdoor:id": gdf['ID'],
      "meta_borough": gdf['MUNICIPALITY'].str.title(),
      "meta_ward_name": gdf["WARD"],
      "meta_ward_number": gdf["WARD"].apply(get_ward_number),
      "meta_source_provider": "City of Toronto",
      "meta_source_dataset_name": "Bicycle Parking - High Capacity (Outdoor)",
      "meta_source_dataset_url": f"https://open.toronto.ca/dataset/bicycle-parking-high-capacity-outdoor/",
      "meta_source_dataset_last_updated": datetime.fromtimestamp(
        previous.metadata["last_updated"].value,
        tz=timezone.utc,
        ).isoformat(),
    })
    .drop(original_cols, axis=1)
  )

  return Output(
    gdf_normalized,
    metadata={
      "num_records": len(gdf_normalized),
      "preview": MetadataValue.md(gdf_normalized.head().to_markdown()),
      "crs": str(gdf_normalized.crs), 
    },
  )
