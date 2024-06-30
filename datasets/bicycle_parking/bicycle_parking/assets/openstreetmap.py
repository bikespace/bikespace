import os
import json
from datetime import datetime, timezone

from dagster import (
  asset, 
  asset_check,
  AssetCheckResult,
  AssetCheckSeverity,
  AssetExecutionContext, 
  MaterializeResult, 
  MetadataValue
)
import geopandas as gpd
import pandas as pd
import pandera as pa

from ..resources.openstreetmap import (
  OpenStreetMapResource,
  feature_from_point_element,
)

gpd.options.io_engine = "pyogrio"

@asset
def osm_bicycle_parking(
  context: AssetExecutionContext,
  openstreetmap: OpenStreetMapResource,
) -> MaterializeResult:
  query = """
    [out:json][timeout:25];
    area(id:3600324211)->.searchArea;
    nwr["amenity"="bicycle_parking"](area.searchArea);
    out center meta;
  """
  data = openstreetmap.request_query(query)
  data_geo_interface = {
    "type": "FeatureCollection",
    "features": [feature_from_point_element(x) for x in data['elements']],
  }
  gdf = gpd.GeoDataFrame.from_features(data_geo_interface, crs=data['crs']['properties']['name'])

  os.makedirs("data", exist_ok=True)
  with open("data/osm_bicycle_parking.geojson", "w") as f:
    f.write(gdf.to_json(na='drop', drop_id=True, indent=2))

  meta_timestamps = pd.to_datetime(gdf['meta_timestamp'], utc=True)

  return MaterializeResult(metadata={
    "num_records": len(gdf),
    "api_last_updated": MetadataValue.timestamp(
      datetime.fromisoformat(data['osm3s']['timestamp_osm_base'])
    ),
    "features_last_updated": MetadataValue.timestamp(
      meta_timestamps.max()
    ),
    "preview": MetadataValue.md(gdf.head().to_markdown()),
    "crs": str(gdf.crs), 
  })