import os
import json
from datetime import datetime, timezone
import re

from dagster import (
    asset,
    asset_check,
    AssetCheckResult,
    AssetCheckSeverity,
    AssetKey,
    AssetExecutionContext,
    MetadataValue,
    Output,
)
import geopandas as gpd
import pandas as pd
import pandera as pa

from .toronto_open_data_source import (
    street_furniture_bicycle_parking,
    bicycle_parking_high_capacity_outdoor,
    bicycle_parking_racks,
    bicycle_parking_bike_stations_indoor,
)
from ..resources.toronto_open_data import (
    WARD_INFO,
    ABOUT_SEASONAL,
    BIKE_STATION_INFO,
)

GROUP_NAME = "city_normalized"


@asset(
    description="""Normalized to filter out bicycle parking objects which are not currently installed, with data converted to OpenStreetMap schema, and with MultiPoint converted to Point.""",
    group_name=GROUP_NAME,
)
def street_furniture_bicycle_parking_normalized(
    context: AssetExecutionContext,
    street_furniture_bicycle_parking,
) -> Output:
    gdf: gpd.GeoDataFrame = street_furniture_bicycle_parking
    original_cols = gdf.columns.drop("geometry")
    previous = context.instance.get_latest_materialization_event(
        AssetKey("street_furniture_bicycle_parking")
    ).asset_materialization

    # filter
    gdf_filtered = gdf[gdf["STATUS"] == "Existing"]

    # normalize
    def get_type(asset_type):
        parking_type = {
            "Ring": "bollard",
            "Rack": "rack",
            "Art Stand": "bollard",  # three entries as of 2023-11 marked as "temporarily removed", appear to be bollards per Google Street View History
            "Shelter": "rack",  # covered rack
            "Other": "stands",  # two entries as of 2023-11, checked on Google Street View
        }
        return parking_type.get(asset_type, None)

    def get_capacity(asset_type):
        parking_capacity = {
            "Ring": 2,
            "Rack": 5,  # likely 5-8 in many cases, but unknown and may vary. 5 is a safe minimum estimate.
            "Art Stand": 2,  # three entries as of 2023-11 marked as "temporarily removed", appear to be bollards per Google Street View History
            "Shelter": None,  # covered rack - appears to vary
            "Other": 2,  # two entries as of 2023-11, checked on Google Street View
        }
        return parking_capacity.get(asset_type, None)

    def get_covered(asset_type):
        return "yes" if asset_type == "Shelter" else "no"

    def get_ward_name(ward_number):
        lookup = WARD_INFO["street_furniture_bicycle_parking"]["lookup"]
        return lookup.get(ward_number, None)

    gdf_normalized = (
        gdf_filtered.assign(
            **{
                "amenity": "bicycle_parking",
                "bicycle_parking": gdf_filtered["ASSETTYPE"].apply(get_type),
                "capacity": gdf_filtered["ASSETTYPE"].apply(get_capacity),
                "operator": "City of Toronto",
                "covered": gdf_filtered["ASSETTYPE"].apply(get_covered),
                "access": "yes",
                "fee": "no",
                "ref:open.toronto.ca:street-furniture-bicycle-parking:id": gdf_filtered[
                    "ID"
                ],
                "meta_status": gdf_filtered["STATUS"],
                "meta_business_improvement_area": gdf_filtered["BIA"],
                "meta_ward_name": gdf_filtered["WARD"].apply(get_ward_name),
                "meta_ward_number": gdf_filtered["WARD"],
                "meta_source_provider": "City of Toronto",
                "meta_source_dataset_name": "Street Furniture - Bicycle Parking",
                "meta_source_dataset_url": "https://open.toronto.ca/dataset/street-furniture-bicycle-parking/",
                "meta_source_dataset_last_updated": datetime.fromtimestamp(
                    previous.metadata["last_updated"].value,
                    tz=timezone.utc,
                ).isoformat(),
            }
        ).drop(original_cols, axis=1)
        # convert multipoint with one coordinate pair to single point
        .explode(index_parts=False)
    )

    return Output(
        gdf_normalized,
        metadata={
            "num_records": len(gdf_normalized),
            "preview": MetadataValue.md(gdf_normalized.head().to_markdown()),
            "crs": str(gdf_normalized.crs),
        },
    )


@asset(
    description="""Normalized with data converted to OpenStreetMap schema and MultiPoint converted to Point.""",
    group_name=GROUP_NAME,
)
def bicycle_parking_high_capacity_outdoor_normalized(
    context: AssetExecutionContext,
    bicycle_parking_high_capacity_outdoor,
) -> Output:
    gdf: gpd.GeoDataFrame = bicycle_parking_high_capacity_outdoor
    original_cols = gdf.columns.drop("geometry")
    previous = context.instance.get_latest_materialization_event(
        AssetKey("bicycle_parking_high_capacity_outdoor")
    ).asset_materialization

    # no filter
    gdf_filtered = gdf

    # normalize
    def get_type(asset_type):
        parking_type = {
            "Bike Rack": "rack",
            "Angled Bike Rack": "rack",
            "Bike Corral": "rack",
            "Bike Shelter": "rack",
        }
        return parking_type.get(asset_type, None)

    def is_covered(asset_type):
        covered_lookup = {
            "Bike Rack": "no",
            "Angled Bike Rack": "no",
            "Bike Corral": "no",
            "Bike Shelter": "yes",
        }
        return covered_lookup.get(asset_type, None)

    def get_description(row):
        values = [
            ("Placement Street: " + row["FLANKING"] if row["FLANKING"] != None else ""),
            ("Place Name: " + row["PLACE_NAME"] if row["PLACE_NAME"] != None else ""),
            ("Details: " + row["DETAILS"] if row["DETAILS"] != None else ""),
        ]
        return "\n\n".join(x.strip() for x in values if x.strip())

    def get_ward_number(ward_name):
        lookup = WARD_INFO["bicycle_parking_high_capacity_outdoor"]["lookup"]
        return lookup.get(ward_name, None)

    gdf_normalized = (
        gdf_filtered.assign(
            **{
                "amenity": "bicycle_parking",
                "bicycle_parking": gdf_filtered["PARKING_TYPE"].apply(get_type),
                "capacity": gdf_filtered["BICYCLE_CAPACITY"],
                "operator": "City of Toronto",
                "covered": gdf_filtered["PARKING_TYPE"].apply(is_covered),
                "access": "yes",
                "fee": "no",
                "start_date": gdf_filtered["YEAR_INSTALLED"],
                "length": gdf_filtered["SIZE_M"].astype(float),
                "description": gdf_filtered[
                    ["FLANKING", "PLACE_NAME", "DETAILS"]
                ].apply(get_description, axis=1),
                "ref:open.toronto.ca:bicycle-parking-high-capacity-outdoor:id": gdf_filtered[
                    "ID"
                ],
                "meta_borough": gdf_filtered["MUNICIPALITY"].str.title(),
                "meta_ward_name": gdf_filtered["WARD"],
                "meta_ward_number": gdf_filtered["WARD"].apply(get_ward_number),
                "meta_source_provider": "City of Toronto",
                "meta_source_dataset_name": "Bicycle Parking - High Capacity (Outdoor)",
                "meta_source_dataset_url": "https://open.toronto.ca/dataset/bicycle-parking-high-capacity-outdoor/",
                "meta_source_dataset_last_updated": datetime.fromtimestamp(
                    previous.metadata["last_updated"].value,
                    tz=timezone.utc,
                ).isoformat(),
            }
        ).drop(original_cols, axis=1)
        # convert multipoint with one coordinate pair to single point
        .explode(index_parts=False)
    )

    return Output(
        gdf_normalized,
        metadata={
            "num_records": len(gdf_normalized),
            "preview": MetadataValue.md(gdf_normalized.head().to_markdown()),
            "crs": str(gdf_normalized.crs),
        },
    )


@asset(
    description="""Normalized to filter out bicycle parking objects which are not currently installed, with data converted to OpenStreetMap schema, and with MultiPoint converted to Point.""",
    group_name=GROUP_NAME,
)
def bicycle_parking_racks_normalized(
    context: AssetExecutionContext,
    bicycle_parking_racks,
) -> Output:
    gdf: gpd.GeoDataFrame = bicycle_parking_racks
    original_cols = gdf.columns.drop("geometry")
    previous = context.instance.get_latest_materialization_event(
        AssetKey("bicycle_parking_racks")
    ).asset_materialization

    # filter
    gdf_filtered = gdf[gdf["STATUS"] == "Installed"]

    # normalize
    def get_covered(sheltered):
        try:
            return sheltered.strip().lower()
        except:
            return None

    def get_description(row):
        values = [
            "Notes: " + row["NOTES"] if row["NOTES"] != None else "",
            "Location: " + row["LOCATION"] if row["LOCATION"] != None else "",
            ABOUT_SEASONAL if row["SEASONAL"] == "Yes" else "",
        ]
        return "\n\n".join(x.strip() for x in values if x.strip())

    def get_ward_name(ward_str):
        match = re.search(WARD_INFO["bicycle_parking_racks"]["pattern"], ward_str)
        return match.group("ward_name") if match else None

    def get_ward_number(ward_str):
        match = re.search(WARD_INFO["bicycle_parking_racks"]["pattern"], ward_str)
        return match.group("ward_number") if match else None

    gdf_normalized = (
        gdf_filtered.assign(
            **{
                "amenity": "bicycle_parking",
                "bicycle_parking": "rack",
                "capacity": gdf_filtered["CAPACITY"],
                "operator": "City of Toronto",
                "covered": gdf_filtered["SHELTERED"].apply(get_covered),
                "access": "yes",
                "fee": "no",
                "description": gdf_filtered[["NOTES", "LOCATION", "SEASONAL"]].apply(
                    get_description, axis=1
                ),
                "seasonal": gdf_filtered["SEASONAL"].str.lower(),
                "ref:open.toronto.ca:bicycle-parking-racks:objectid": gdf["OBJECTID"],
                "meta_borough": gdf_filtered["MUNICIPALITY"].str.title(),
                "meta_status": gdf_filtered["STATUS"],
                "meta_ward_name": gdf_filtered["WARD_NAME"].apply(get_ward_name),
                "meta_ward_number": gdf_filtered["WARD_NAME"].apply(get_ward_number),
                "meta_source_provider": "City of Toronto",
                "meta_source_dataset_name": "Bicycle Parking Racks",
                "meta_source_dataset_url": "https://open.toronto.ca/dataset/bicycle-parking-racks/",
                "meta_source_dataset_last_updated": datetime.fromtimestamp(
                    previous.metadata["last_updated"].value,
                    tz=timezone.utc,
                ).isoformat(),
            }
        ).drop(original_cols, axis=1)
        # convert multipoint with one coordinate pair to single point
        .explode(index_parts=False)
    )

    return Output(
        gdf_normalized,
        metadata={
            "num_records": len(gdf_normalized),
            "preview": MetadataValue.md(gdf_normalized.head().to_markdown()),
            "crs": str(gdf_normalized.crs),
        },
    )


@asset(  # TODO update description
    description="""Normalized to filter out bicycle parking objects which are not currently installed, with data converted to OpenStreetMap schema, and with MultiPoint converted to Point.""",
    group_name=GROUP_NAME,
)
def bicycle_parking_bike_stations_indoor_normalized(
    context: AssetExecutionContext,
    bicycle_parking_bike_stations_indoor,
) -> Output:
    gdf: gpd.GeoDataFrame = bicycle_parking_bike_stations_indoor
    original_cols = gdf.columns.drop("geometry")
    previous = context.instance.get_latest_materialization_event(
        AssetKey("bicycle_parking_bike_stations_indoor")
    ).asset_materialization

    # no filter
    gdf_filtered = gdf

    # normalize
    def get_capacity(row):
        """Note: revises capacity of City Hall / Nathan Phillips Square to 170 from website blurb instead of 300 from API"""
        return min(
            row["BIKE_CAPACITY"],
            BIKE_STATION_INFO.get(row["ADDRESS_FULL"], None).get("capacity", None),
        )

    def get_description(row):
        values = [
            "Access from: " + row["FLANKING"] if row["FLANKING"] != None else "",
            BIKE_STATION_INFO.get(row["ADDRESS_FULL"], None).get("description", None),
        ]
        return "\n\n".join(x.strip() for x in values if x.strip())

    def get_name(row):
        place = (
            row["PLACE_NAME"] if row["PLACE_NAME"] != None else row["TRANSIT_STATION"]
        )
        return "Bicycle Parking Station at " + place

    def get_ward_name(ward_str):
        match = re.search(
            WARD_INFO["bicycle_parking_bike_stations_indoor"]["pattern"], ward_str
        )
        return match.group("ward_name") if match else None

    def get_ward_number(ward_str):
        match = re.search(
            WARD_INFO["bicycle_parking_bike_stations_indoor"]["pattern"], ward_str
        )
        return match.group("ward_number") if match else None

    gdf_normalized = (
        gdf_filtered.assign(
            **{
                "amenity": "bicycle_parking",
                "bicycle_parking": "building",
                "capacity": gdf_filtered[["BIKE_CAPACITY", "ADDRESS_FULL"]].apply(
                    get_capacity, axis=1
                ),
                "operator": "City of Toronto",
                "covered": "yes",
                "access": "customers",
                "fee": "yes",
                "supervised": "no",  # per the website, staff may be present from time to time at certain stations but are not dedicated to supervision and are not present during all access hours.
                "opening_hours": "Mo-Su,PH 00:00-24:00",  # 24/7 including holidays
                "description": gdf_filtered[["FLANKING", "ADDRESS_FULL"]].apply(
                    get_description, axis=1
                ),
                "website": "https://www.toronto.ca/services-payments/streets-parking-transportation/cycling-in-toronto/bicycle-parking/bicycle-parking-stations/",
                "name": gdf_filtered[["PLACE_NAME", "TRANSIT_STATION"]].apply(
                    get_name, axis=1
                ),
                "addr:housenumber": gdf_filtered["ADDRESS_NUMBER"],
                "addr:street": gdf_filtered["LINEAR_NAME_FULL"],
                "addr:city": gdf_filtered["CITY"],
                "addr:postcode": gdf_filtered["POSTAL_CODE"],
                "start_date": gdf_filtered["YR_INSTALL"],
                "ref:open.toronto.ca:bicycle-parking-bike-stations-indoor:id": gdf_filtered[
                    "ID"
                ],
                "meta_borough": gdf_filtered["MUNICIPALITY"].str.title(),
                "meta_ward_name": gdf_filtered["WARD_NAME"].apply(get_ward_name),
                "meta_ward_number": gdf_filtered["WARD_NAME"].apply(get_ward_number),
                "meta_has_change_room": gdf_filtered[
                    "CHANGE_ROOM"
                ],  # amenity=dressing_room
                "meta_has_tools_and_pump": gdf_filtered[
                    "TOOLS_PUMP"
                ],  #  amenity=bicycle_repair_station
                "meta_has_vending_machine": gdf_filtered[
                    "VENDING_MACHINE"
                ],  # amenity=vending_machine
                "meta_source_provider": "City of Toronto",
                "meta_source_dataset_name": "Bicycle Parking - Bike Stations (Indoor)",
                "meta_source_dataset_url": "https://open.toronto.ca/dataset/bicycle-parking-bike-stations-indoor/",
                "meta_source_dataset_last_updated": datetime.fromtimestamp(
                    previous.metadata["last_updated"].value,
                    tz=timezone.utc,
                ).isoformat(),
            }
        ).drop(original_cols, axis=1)
        # convert multipoint with one coordinate pair to single point
        .explode(index_parts=False)
    )

    return Output(
        gdf_normalized,
        metadata={
            "num_records": len(gdf_normalized),
            "preview": MetadataValue.md(gdf_normalized.head().to_markdown()),
            "crs": str(gdf_normalized.crs),
        },
    )
