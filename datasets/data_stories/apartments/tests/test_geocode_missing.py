import pandas as pd

from apartments.geocode_missing import geocode_missing

# TODO - add the cache in to the geocoding function

test_df = pd.DataFrame(
    [
        {
            "description": "existing lat long",
            "address": "36 SPENCER AVE",
            "latitude": 43.634955198449894,
            "longitude": -79.429994303185111,
        },
        {
            "description": "lat long cached",
            "address": "9 STAG HILL DR",
            "latitude": None,
            "longitude": None,
        },
        {
            "description": "lat long geocoded",
            "address": "39 NIAGARA ST",
            "latitude": None,
            "longitude": None,
        },
    ]
)
CACHED_ADDRESS = "9 STAG HILL DR"
test_cache = {
    CACHED_ADDRESS: {
        "latitude": 43,  # fake lat
        "longitude": -79,  # fake long
    },
}


def test_geocode_missing():
    geocoded_df = geocode_missing(
        test_df, "latitude", "longitude", "address", test_cache,)["df"]

    assert len(test_df) == len(geocoded_df)

    assert not (
        geocoded_df["latitude"].hasnans or geocoded_df["longitude"].hasnans)

    cached_row = geocoded_df[
        geocoded_df["address"] == CACHED_ADDRESS
    ].squeeze()
    assert cached_row["latitude"] == test_cache[CACHED_ADDRESS]["latitude"]
    assert cached_row["longitude"] == test_cache[CACHED_ADDRESS]["longitude"]
