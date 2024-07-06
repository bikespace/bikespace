import os
import json
from datetime import datetime, timezone

from dagster import (
  asset, 
  asset_check,
  AssetCheckResult,
  AssetCheckSeverity,
  AssetExecutionContext,
  MetadataValue,
  Output,
)
import geopandas as gpd
import pandas as pd
import pandera as pa

from ..resources.openstreetmap import (
  OpenStreetMapResource,
  feature_from_point_element,
)

gpd.options.io_engine = "pyogrio"
GROUP_NAME = "osm_source"


@asset(
  description="""Data from OpenStreetMap: nodes, ways, and relations with the tag "amenity"="bicycle_parking" within the City of Toronto. Returns centrepoint for ways (and relations, if any); does not return full geometry.""",
  group_name=GROUP_NAME,
)
def osm_bicycle_parking(
  context: AssetExecutionContext,
  openstreetmap: OpenStreetMapResource,
) -> Output:
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

  meta_timestamps = pd.to_datetime(gdf['meta_timestamp'], utc=True)

  return Output(
    gdf,
    metadata={
      "num_records": len(gdf),
      "num_features_no_type": len(gdf) - len(gdf["bicycle_parking"].dropna()),
      "num_features_no_capacity": len(gdf) - len(gdf["capacity"].dropna()),
      "api_last_updated": MetadataValue.timestamp(
        datetime.fromisoformat(data['osm3s']['timestamp_osm_base'])
      ),
      "features_last_updated": MetadataValue.timestamp(
        meta_timestamps.max()
      ),
      "preview": MetadataValue.md(gdf.head().to_markdown()),
      "crs": str(gdf.crs), 
    },
  )
