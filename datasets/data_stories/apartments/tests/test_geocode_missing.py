import geopandas as gpd

from apartments.geocode_missing import geocode_missing

# TODO - add the cache in to the geocoding function

test_gdf = gpd.GeoDataFrame(
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
    geocoded_gdf = geocode_missing(
        test_gdf, "latitude", "longitude", "address", test_cache,)["gdf"]

    assert len(test_gdf) == len(geocoded_gdf)

    assert not (
        geocoded_gdf["latitude"].hasnans or geocoded_gdf["longitude"].hasnans)

    cached_row = geocoded_gdf[
        geocoded_gdf["address"] == CACHED_ADDRESS
    ].squeeze()
    assert cached_row["latitude"] == test_cache[CACHED_ADDRESS]["latitude"]
    assert cached_row["longitude"] == test_cache[CACHED_ADDRESS]["longitude"]
