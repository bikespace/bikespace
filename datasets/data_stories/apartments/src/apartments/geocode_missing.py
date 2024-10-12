from pathlib import Path
from typing import TypedDict

import geopandas as gpd
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
import pandas as pd
import pandera as pa
from tqdm import tqdm

tqdm.pandas()


class AddressCacheItem(TypedDict):
    latitude: float
    longitude: float


type AddressCache = dict[str, AddressCacheItem]


class GeoCodeDFResult(TypedDict):
    gdf: gpd.GeoDataFrame
    address_cache: AddressCache


# get addresses that are missing lat/long
# get addresses not in the cache
# geocode them and add them to the cache
# update the whole df from the cache


def geocode_missing(
    gdf: gpd.GeoDataFrame,
    lat_col: str,
    long_col: str,
    address_col: str,
    address_cache: AddressCache = {},
) -> GeoCodeDFResult:
    """Geocode and cache location for rows that do not have a latitude or longitude value"""
    gdf_missing = gdf[gdf[lat_col].isna() | gdf[long_col].isna()].copy()

    # get uncached addresses
    addresses = gdf_missing[address_col]
    cached_addresses = pd.Series(address_cache.keys())
    uncached_addresses = addresses[~ addresses.isin(cached_addresses)]

    # set up geocoder
    geolocator = Nominatim(user_agent="bikespace_data_stories_apartments")
    geocode = RateLimiter(
        lambda a: geolocator.geocode(f"{a}, Toronto, ON, Canada"), min_delay_seconds=1
    )

    # geocode missing addresses
    located_addresses = list(zip(
        uncached_addresses,
        uncached_addresses.apply(geocode),
    ))
    add_to_cache: AddressCache = {address: {
        "latitude": location.point.latitude,
        "longitude": location.point.longitude,
    } for address, location in located_addresses}

    # update cache
    address_cache = address_cache | add_to_cache

    # add missing locations from updated cache
    gdf_missing[lat_col] = [
        address_cache[address]["latitude"] for address in gdf_missing[address_col]
    ]
    gdf_missing[long_col] = [
        address_cache[address]["longitude"] for address in gdf_missing[address_col]
    ]
    gdf_geocoded = gdf_missing.combine_first(gdf)

    return {
        "gdf": gdf_geocoded,
        "address_cache": address_cache,
    }
