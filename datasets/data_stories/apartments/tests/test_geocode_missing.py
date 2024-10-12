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
test_cache = {
    "9 STAG HILL DR": {
        "latitude": 43.703363564,
        "longitude": -79.310527323000002,
    },
}


def test_geocode_missing():
    geocoded_gdf = geocode_missing(
        test_gdf, "latitude", "longitude", "address")
    assert not (
        geocoded_gdf["latitude"].hasnans or geocoded_gdf["longitude"].hasnans)
