import geopandas as gpd
from bicycle_parking.resources.filesystem_io import convert_dt_to_str


def test_io_timestamp_conversion():
    """Requires osm_bicycle_parking to have been materialized at least once"""
    gdf = gpd.read_file("./data/osm_bicycle_parking.geojson")
    converted = convert_dt_to_str(gdf)
    breakpoint()
    assert len(converted.select_dtypes(
        include=["datetime", "datetime64[ms, UTC]"]).columns
    ) == 0
