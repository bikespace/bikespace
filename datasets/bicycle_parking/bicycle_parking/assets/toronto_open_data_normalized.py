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
  street_furniture_bicycle_parking
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
  previous = context.instance.get_latest_materialization_event(AssetKey("street_furniture_bicycle_parking")).asset_materialization

  # filter
  gdf_filtered = gdf[gdf['STATUS'] == "Existing"]

  # normalize
  original_cols = gdf_filtered.columns.drop("geometry")

  def get_type(assettype):
    parking_type = {
      'Ring': "bollard", 
      'Rack': "rack", 
      'Art Stand': "bollard", # three entries as of 2023-11 marked as "temporarily removed", appear to be bollards per Google Street View History
      'Shelter': "rack", # covered rack
      'Other': "stands", # two entries as of 2023-11, checked on Google Street View
    }
    return parking_type.get(assettype, None)

  def get_capacity(assettype):
    parking_capacity = {
      'Ring': 2, 
      'Rack': 5, # likely 5-8 in many cases, but unknown and may vary. 5 is a safe minimum estimate.
      'Art Stand': 2, # three entries as of 2023-11 marked as "temporarily removed", appear to be bollards per Google Street View History
      'Shelter': None, # covered rack - appears to vary
      'Other': 2, # two entries as of 2023-11, checked on Google Street View
    }
    return parking_capacity.get(assettype, None)

  def get_covered(assettype):
    return "yes" if assettype == "Shelter" else "no"

  def get_ward_name(ward_number):
    WARD_INFO["street_furniture_bicycle_parking"].get(ward_number, None)

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