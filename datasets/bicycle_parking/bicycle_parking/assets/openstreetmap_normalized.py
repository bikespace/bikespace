import os
import json
from datetime import datetime, timezone

from dagster import (
    asset,
    asset_check,
    AssetCheckResult,
    AssetCheckSeverity,
    AssetExecutionContext,
    AssetKey,
    MetadataValue,
    Output,
)
import geopandas as gpd
import pandas as pd
import pandera as pa

from .openstreetmap_source import osm_bicycle_parking

GROUP_NAME = "osm_normalized"


@asset(
    description="""Normalized to...""",
    group_name=GROUP_NAME,
)
def osm_bicycle_parking_normalized(
    context: AssetExecutionContext,
    osm_bicycle_parking,
) -> Output:
    gdf: gpd.GeoDataFrame = osm_bicycle_parking
    previous = context.instance.get_latest_materialization_event(
        AssetKey("osm_bicycle_parking")
    ).asset_materialization

    # no filter
    gdf_filtered = gdf

    gdf_normalized = gdf_filtered.assign(
        **{
            "meta_source_provider": "OpenStreetMap",
            "meta_source_dataset_last_updated": datetime.fromtimestamp(
                previous.metadata["features_last_updated"].value,
                tz=timezone.utc,
            ).isoformat(),
        }
    )

    return Output(
        gdf_normalized,
        metadata={
            "num_records": len(gdf_normalized),
            "preview": MetadataValue.md(gdf_normalized.head().to_markdown()),
            "crs": str(gdf_normalized.crs),
        },
    )
