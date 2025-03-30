# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "geopandas",
#     "pandas",
# ]
# ///

import pandas as pd
import geopandas as gpd

# read csv extract of old data
older_source = pd.read_csv("old_parking_data.csv")
older_data: gpd.GeoDataFrame = gpd.GeoDataFrame(
    older_source,
    geometry=gpd.points_from_xy(older_source["Lon"], older_source["Lat"]),
    crs="EPSG:4326",
)

# export as geojson
older_data.to_file("old_parking_data.geojson")

# get newer parking data
newer_data: gpd.GeoDataFrame = gpd.GeoDataFrame.from_file(
    "https://raw.githubusercontent.com/tallcoleman/new-parking-map/main/Display%20Files/all_sources.geojson"
)

# reproject to EPSG:32617 (WGS 84 / UTM zone 17N)
newer_utm17n = newer_data.to_crs(32617)
older_utm17n = older_data.to_crs(32617)

# get all old parking data points that are not within 30m of a newer data point
newer_utm17n_buffer = newer_utm17n.set_geometry(newer_utm17n.geometry.buffer(30))
unique_older = older_utm17n.overlay(newer_utm17n_buffer, how="difference")
unique_older.to_file("old_parking_data_unique.geojson")
