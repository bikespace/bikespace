from pathlib import Path
from typing import TypedDict

from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
import pandas as pd
from tqdm import tqdm

tqdm.pandas()


class AddressCacheItem(TypedDict):
    latitude: float
    longitude: float


type AddressCacheDict = dict[str, AddressCacheItem]


class GeoCodeDFResult(TypedDict):
    df: pd.DataFrame
    address_cache: AddressCacheDict


def geocode_missing(
    df: pd.DataFrame,
    lat_col: str,
    long_col: str,
    address_col: str,
    address_cache: AddressCacheDict = {},
) -> GeoCodeDFResult:
    """Geocode and cache location for rows that do not have a latitude or longitude value"""
    df_missing = df[df[lat_col].isna() | df[long_col].isna()].copy()

    # get uncached addresses
    addresses = df_missing[address_col]
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
    add_to_cache: AddressCacheDict = {address: {
        "latitude": location.point.latitude,
        "longitude": location.point.longitude,
    } for address, location in located_addresses}

    # update cache
    address_cache = address_cache | add_to_cache

    # add missing locations from updated cache
    df_missing[lat_col] = [
        address_cache[address]["latitude"] for address in df_missing[address_col]
    ]
    df_missing[long_col] = [
        address_cache[address]["longitude"] for address in df_missing[address_col]
    ]
    df_geocoded = df_missing.combine_first(df)

    return {
        "df": df_geocoded,
        "address_cache": address_cache,
    }
