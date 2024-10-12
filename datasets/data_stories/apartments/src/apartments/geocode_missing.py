from pathlib import Path

import geopandas as gpd
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
import pandas as pd
import pandera as pa
from tqdm import tqdm


def geocode_missing(
    gdf: gpd.GeoDataFrame,
    lat_col: str,
    long_col: str,
    address_col: str,
) -> gpd.GeoDataFrame:
    """Geocode and cache location for rows that do not have a latitude or longitude value"""
    gdf_missing = gdf[gdf[lat_col].isna() | gdf[long_col].isna()].copy()

    tqdm.pandas()
    geolocator = Nominatim(user_agent="bikespace_data_stories_apartments")
    geocode = RateLimiter(
        lambda a: geolocator.geocode(f"{a}, Toronto, ON, Canada"), min_delay_seconds=1
    )

    gdf_missing["location"] = gdf_missing[address_col].apply(geocode)
    gdf_missing[lat_col] = [
        l.point.latitude for l in gdf_missing["location"]]
    gdf_missing[long_col] = [
        l.point.longitude for l in gdf_missing["location"]]
    gdf_missing = gdf_missing.drop(columns=["location"])

    return gdf_missing
