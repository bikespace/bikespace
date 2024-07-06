import os
import json
from datetime import datetime, timezone

from dagster import (
    asset,
    asset_check,
    AssetCheckResult,
    AssetCheckSeverity,
    AssetExecutionContext,
    MetadataValue,
    Output,
)
import geopandas as gpd
import pandas as pd
import pandera as pa

from ..resources.toronto_open_data import (
    TorontoOpenDataResource,
    WARD_INFO,
    BIKE_STATION_INFO,
)

GROUP_NAME = "city_source"

# type shorthands
optional_string = pa.Column(str, required=False)
optional_nullable_string = pa.Column(str, nullable=True, required=False)
optional_int32 = pa.Column("int32", required=False)


@asset(
    description="""City of Toronto bicycle parking data from the "Street Furniture - Bicycle Parking" dataset. See: https://open.toronto.ca/dataset/street-furniture-bicycle-parking/""",
    group_name=GROUP_NAME,
)
def street_furniture_bicycle_parking(
    context: AssetExecutionContext,
    toronto_open_data: TorontoOpenDataResource,
) -> Output:
    gdf: gpd.GeoDataFrame
    metadata: dict
    gdf, metadata = toronto_open_data.request_gdf(
        dataset_name="street-furniture-bicycle-parking",
        resource_id="282ec79d-983e-4b4a-a8b6-e67574a1c6dd",
    ).values()

    return Output(
        gdf,
        metadata={
            "num_records": len(gdf),
            "last_updated": MetadataValue.timestamp(
                datetime.fromisoformat(metadata["last_modified"] + "+00:00")
            ),
            "preview": MetadataValue.md(gdf.head().to_markdown()),
            "crs": str(gdf.crs),
        },
    )


@asset_check(asset=street_furniture_bicycle_parking, blocking=True)
def validate_sfbp_blocking(
    gdf: gpd.GeoDataFrame = street_furniture_bicycle_parking,
) -> AssetCheckResult:
    schema = pa.DataFrameSchema(
        {
            # REQUIRED FIELDS
            "ID": pa.Column(str, unique=True),
            "ASSETTYPE": pa.Column(
                str,
                nullable=True,
                checks=pa.Check.isin(
                    ["Ring", "Rack", "Art Stand", "Shelter", "Other"],
                    ignore_na=True,
                ),
            ),
            "STATUS": pa.Column(
                str,
                checks=pa.Check.isin(["Existing", "Temporarily Removed"]),
            ),
            "geometry": pa.Column(
                "geometry",
                # check that there is only one coordinate pair per MultiPoint
                checks=pa.Check(lambda s: s.apply(lambda x: len(x.geoms) == 1)),
            ),
        },
    )
    test = type(schema.validate(gdf)) == gpd.GeoDataFrame
    return AssetCheckResult(
        passed=bool(test),
        severity=AssetCheckSeverity.ERROR,
    )


@asset_check(asset=street_furniture_bicycle_parking)
def validate_sfbp_info(
    gdf: gpd.GeoDataFrame = street_furniture_bicycle_parking,
) -> AssetCheckResult:
    schema = pa.DataFrameSchema(
        {
            # REQUIRED FIELDS
            "ID": pa.Column(
                str,
                unique=True,
                checks=pa.Check.str_matches(r"BP-\d{5}"),  # e.g. BP-12345
            ),
            "WARD": pa.Column(
                str,
                nullable=True,
                checks=pa.Check.isin(
                    list(WARD_INFO["street_furniture_bicycle_parking"]["lookup"].keys())
                ),
            ),
            "BIA": pa.Column(str, nullable=True),
            "ASSETTYPE": pa.Column(
                str,
                nullable=True,
                checks=pa.Check.isin(
                    ["Ring", "Rack", "Art Stand", "Shelter", "Other"],
                    ignore_na=True,
                ),
            ),
            "STATUS": pa.Column(
                str,
                checks=pa.Check.isin(["Existing", "Temporarily Removed"]),
            ),
            "geometry": pa.Column("geometry"),
            # OTHER FIELDS
            "_id": optional_int32,
            # OBJECTID is not a primary key - inconsistent between updates
            "OBJECTID": optional_int32,
            "ADDRESSNUMBERTEXT": optional_nullable_string,
            "ADDRESSSTREET": optional_nullable_string,
            "FRONTINGSTREET": optional_nullable_string,
            "SIDE": optional_nullable_string,
            "FROMSTREET": optional_nullable_string,
            "DIRECTION": optional_nullable_string,
            "SITEID": optional_nullable_string,
            "SDE_STATE_ID": optional_int32,
        },
        strict=True,
    )
    test = type(schema.validate(gdf)) == gpd.GeoDataFrame
    return AssetCheckResult(
        passed=bool(test),
        severity=AssetCheckSeverity.WARN,
    )


@asset(
    description="""City of Toronto bicycle parking data from the "Bicycle Parking - High Capacity (Outdoor)" dataset. See https://open.toronto.ca/dataset/bicycle-parking-high-capacity-outdoor/""",
    group_name=GROUP_NAME,
)
def bicycle_parking_high_capacity_outdoor(
    context: AssetExecutionContext,
    toronto_open_data: TorontoOpenDataResource,
) -> Output:
    gdf: gpd.GeoDataFrame
    metadata: dict
    gdf, metadata = toronto_open_data.request_gdf(
        dataset_name="bicycle-parking-high-capacity-outdoor",
        resource_id="9dd8ada5-109d-4ca7-a25a-d0fe234b6710",
    ).values()

    gdf = gdf.astype({"ID": str, "SIZE_M": float})

    return Output(
        gdf,
        metadata={
            "num_records": len(gdf),
            "last_updated": MetadataValue.timestamp(
                datetime.fromisoformat(metadata["last_modified"] + "+00:00")
            ),
            "preview": MetadataValue.md(gdf.head().to_markdown()),
            "crs": str(gdf.crs),
        },
    )


@asset_check(asset=bicycle_parking_high_capacity_outdoor, blocking=True)
def validate_bphco_blocking(
    gdf: gpd.GeoDataFrame = bicycle_parking_high_capacity_outdoor,
) -> AssetCheckResult:
    schema = pa.DataFrameSchema(
        {
            # REQUIRED FIELDS
            "ID": pa.Column(str, coerce=True, unique=True),
            "PARKING_TYPE": pa.Column(
                str,
                checks=pa.Check.isin(
                    ["Bike Rack", "Angled Bike Rack", "Bike Corral", "Bike Shelter"]
                ),
            ),
            "BICYCLE_CAPACITY": pa.Column("int32"),
            "geometry": pa.Column(
                "geometry",
                # check that there is only one coordinate pair per MultiPoint
                checks=pa.Check(lambda s: s.apply(lambda x: len(x.geoms) == 1)),
            ),
        }
    )
    test = type(schema.validate(gdf)) == gpd.GeoDataFrame
    return AssetCheckResult(
        passed=bool(test),
        severity=AssetCheckSeverity.ERROR,
    )


@asset_check(asset=bicycle_parking_high_capacity_outdoor)
def validate_bphco_info(
    gdf: gpd.GeoDataFrame = bicycle_parking_high_capacity_outdoor,
) -> AssetCheckResult:
    schema = pa.DataFrameSchema(
        {
            # REQUIRED FIELDS
            "ID": pa.Column(
                str,
                coerce=True,
                unique=True,
                checks=pa.Check.str_matches(r"\d+"),  # e.g. "1", "13"
            ),
            "MUNICIPALITY": pa.Column(
                str,
                checks=pa.Check.isin(
                    [
                        "Etobicoke",
                        "North York",
                        "Scarborough",
                        "York",
                        "East York",
                        "former Toronto",
                    ]
                ),
            ),
            "WARD": pa.Column(
                str,
                nullable=True,
                checks=pa.Check.isin(
                    list(
                        WARD_INFO["bicycle_parking_high_capacity_outdoor"][
                            "lookup"
                        ].keys()
                    )
                ),
            ),
            "PLACE_NAME": pa.Column(str, nullable=True),
            "PARKING_TYPE": pa.Column(
                str,
                checks=pa.Check.isin(
                    ["Bike Rack", "Angled Bike Rack", "Bike Corral", "Bike Shelter"]
                ),
            ),
            "FLANKING": pa.Column(str, nullable=True),
            "BICYCLE_CAPACITY": pa.Column("int32"),
            "SIZE_M": pa.Column(float),
            "YEAR_INSTALLED": pa.Column("int32"),
            "DETAILS": pa.Column(str, nullable=True),
            "geometry": pa.Column("geometry"),
            # OTHER FIELDS
            "_id": optional_int32,
            # OBJECTID is not a primary key - inconsistent between updates
            "OBJECTID": optional_int32,
            "ADDRESS_POINT_ID": optional_int32,
            "ADDRESS_NUMBER": optional_string,
            "LINEAR_NAME_FULL": optional_string,
            "ADDRESS_FULL": optional_string,
            "POSTAL_CODE": optional_nullable_string,
            "CITY": pa.Column(
                str,
                required=False,
                checks=pa.Check.equal_to("Toronto"),
            ),
            "GENERAL_USE_CODE": optional_int32,
            "CENTRELINE_ID": optional_int32,
            "LO_NUM": optional_int32,
            "LO_NUM_SUF": optional_nullable_string,
            "HI_NUM": optional_int32,
            "LINEAR_NAME_ID": optional_int32,
            "BY_LAW": pa.Column(
                str,
                required=False,
                checks=pa.Check.isin(["N/A", "NO", "Y"]),
            ),
        },
        strict=True,
    )
    test = type(schema.validate(gdf)) == gpd.GeoDataFrame
    return AssetCheckResult(
        passed=bool(test),
        severity=AssetCheckSeverity.WARN,
    )


@asset(
    description="""City of Toronto bicycle parking data from the "Bicycle Parking Racks" dataset. See: https://open.toronto.ca/dataset/bicycle-parking-racks/""",
    group_name=GROUP_NAME,
)
def bicycle_parking_racks(
    context: AssetExecutionContext,
    toronto_open_data: TorontoOpenDataResource,
) -> Output:
    gdf: gpd.GeoDataFrame
    metadata: dict
    gdf, metadata = toronto_open_data.request_gdf(
        dataset_name="bicycle-parking-racks",
        resource_id="4d105465-6e64-4a69-957b-6e0eee5bca8b",
    ).values()

    gdf = gdf.astype({"OBJECTID": str})
    gdf = gdf.replace(" ", pd.NA).replace("", pd.NA)

    return Output(
        gdf,
        metadata={
            "num_records": len(gdf),
            "last_updated": MetadataValue.timestamp(
                datetime.fromisoformat(metadata["last_modified"] + "+00:00")
            ),
            "preview": MetadataValue.md(gdf.head().to_markdown()),
            "crs": str(gdf.crs),
        },
    )


@asset_check(asset=bicycle_parking_racks)
def validate_bpr(gdf: gpd.GeoDataFrame = bicycle_parking_racks) -> AssetCheckResult:
    schema = pa.DataFrameSchema(
        {
            # REQUIRED FIELDS
            "OBJECTID": pa.Column(str, unique=True),
            "MUNICIPALITY": pa.Column(
                str,
                checks=pa.Check.isin(
                    [
                        "ETOBICOKE",
                        "NORTH YORK",
                        "SCARBOROUGH",
                        "YORK",
                        "EAST YORK",
                        "former TORONTO",
                    ]
                ),
            ),
            "WARD_NAME": pa.Column(
                str,
                checks=pa.Check.str_matches(
                    WARD_INFO["bicycle_parking_racks"]["pattern"]
                ),
            ),
            "CAPACITY": pa.Column("int32"),
            "SEASONAL": pa.Column(
                str,
                checks=pa.Check.isin(["No", "Yes"]),
            ),
            "SHELTERED": pa.Column(
                str,
                nullable=True,
                checks=pa.Check.isin(["No", "Yes"]),
            ),
            "STATUS": pa.Column(
                str,
                checks=pa.Check.isin(
                    ["Delivered", "Installed", "Approved", "Proposed", "TBD"]
                ),
            ),
            "LOCATION": pa.Column(str, nullable=True),
            "NOTES": pa.Column(str, nullable=True),
            "MAP_CLASS": pa.Column(
                str,
                checks=pa.Check.isin(
                    [
                        "Multi-Bike Rack",
                        "Multi-Bike Rack (Angled)",
                        "Bike Shelter",
                        "Bike Corral",
                    ]
                ),
            ),
            "geometry": pa.Column(
                "geometry",
                # check that there is only one coordinate pair per MultiPoint
                checks=pa.Check(lambda s: s.apply(lambda x: len(x.geoms) == 1)),
            ),
            # OTHER FIELDS
            "_id": optional_int32,
            # OBJECTID is not a primary key - inconsistent between updates
            "OBJECTID": optional_string,
            "ADDRESS_POINT_ID": optional_int32,
            "ADDRESS_NUMBER": optional_string,
            "LINEAR_NAME_FULL": optional_string,
            "ADDRESS_FULL": optional_string,
            "POSTAL_CODE": optional_nullable_string,
            "CITY": pa.Column(
                str,
                required=False,
                checks=pa.Check.equal_to("Toronto"),
            ),
            "CENTRELINE_ID": optional_int32,
            "LO_NUM": optional_int32,
            "LO_NUM_SUF": optional_nullable_string,
            "HI_NUM": optional_int32,
            "HI_NUM_SUF": optional_string,
            "LINEAR_NAME_ID": optional_int32,
            "MI_PRINX": optional_int32,
            "MULTIMODAL": pa.Column(
                str,
                required=False,
                checks=pa.Check.isin(["No", "Yes"]),
            ),
            "SURFACE": optional_nullable_string,
        },
        strict=True,
    )
    test = type(schema.validate(gdf)) == gpd.GeoDataFrame
    return AssetCheckResult(
        passed=bool(test),
        severity=AssetCheckSeverity.WARN,
    )


@asset(
    description="""City of Toronto bicycle parking data from the "Bicycle Parking - Bike Stations (Indoor)" dataset. Some out-of-date station information is overwritten using information copied from https://www.toronto.ca/services-payments/streets-parking-transportation/cycling-in-toronto/bicycle-parking/bicycle-parking-stations/ (last checked 2024-06). See: https://open.toronto.ca/dataset/bicycle-parking-bike-stations-indoor/""",
    group_name=GROUP_NAME,
)
def bicycle_parking_bike_stations_indoor(
    context: AssetExecutionContext,
    toronto_open_data: TorontoOpenDataResource,
) -> Output:
    gdf: gpd.GeoDataFrame
    metadata: dict
    gdf, metadata = toronto_open_data.request_gdf(
        dataset_name="bicycle-parking-bike-stations-indoor",
        resource_id="c7829eee-131c-430d-a8de-a0b509b6d8f2",
    ).values()

    gdf = gdf.astype({"ID": str})

    return Output(
        gdf,
        metadata={
            "num_records": len(gdf),
            "last_updated": MetadataValue.timestamp(
                datetime.fromisoformat(metadata["last_modified"] + "+00:00")
            ),
            "preview": MetadataValue.md(gdf.head().to_markdown()),
            "crs": str(gdf.crs),
        },
    )


@asset_check(asset=bicycle_parking_bike_stations_indoor)
def validate_bpbsi(
    gdf: gpd.GeoDataFrame = bicycle_parking_bike_stations_indoor,
) -> AssetCheckResult:
    schema = pa.DataFrameSchema(
        {
            # REQUIRED FIELDS
            "ID": pa.Column(
                str,
                coerce=True,
                unique=True,
                checks=pa.Check.str_matches(r"\d+"),  # e.g. "1", "13"
            ),
            "ADDRESS_NUMBER": pa.Column(str),
            "LINEAR_NAME_FULL": pa.Column(str),
            "ADDRESS_FULL": pa.Column(
                str, checks=pa.Check.isin(list(BIKE_STATION_INFO.keys()))
            ),
            "POSTAL_CODE": pa.Column(str, nullable=True),
            "MUNICIPALITY": pa.Column(
                str,
                checks=pa.Check.isin(
                    [
                        "Etobicoke",
                        "North York",
                        "Scarborough",
                        "York",
                        "East York",
                        "former Toronto",
                    ]
                ),
            ),
            "CITY": pa.Column(
                str,
                checks=pa.Check.equal_to("Toronto"),
            ),
            "WARD_NAME": pa.Column(
                str,
                checks=pa.Check.str_matches(
                    WARD_INFO["bicycle_parking_bike_stations_indoor"]["pattern"]
                ),
            ),
            "PLACE_NAME": pa.Column(str, nullable=True),
            "STATION_TYPE": pa.Column(
                str,
                checks=pa.Check.equal_to("Bicycle Station"),
            ),
            "TRANSIT_STATION": pa.Column(str),
            "FLANKING": pa.Column(str),
            "BIKE_CAPACITY": pa.Column("int32"),
            "CHANGE_ROOM": pa.Column(
                str,
                checks=pa.Check.isin(["No", "Yes"]),
            ),
            "VENDING_MACHINE": pa.Column(
                str,
                checks=pa.Check.isin(["No", "Yes"]),
            ),
            "TOOLS_PUMP": pa.Column(
                str,
                checks=pa.Check.isin(["No", "Yes"]),
            ),
            "YR_INSTALL": pa.Column("int32"),
            "geometry": pa.Column(
                "geometry",
                # check that there is only one coordinate pair per MultiPoint
                checks=pa.Check(lambda s: s.apply(lambda x: len(x.geoms) == 1)),
            ),
            # OTHER FIELDS
            "_id": optional_int32,
            # OBJECTID is not a primary key - inconsistent between updates
            "OBJECTID": optional_string,
            "ADDRESS_POINT_ID": optional_int32,
            "GENERAL_USE_CODE": optional_int32,
            "CENTRELINE_ID": optional_int32,
            "LO_NUM": optional_int32,
            "HI_NUM": optional_int32,
            "LINEAR_NAME_ID": optional_int32,
            "MI_PRINX": optional_int32,
        },
        strict=True,
    )
    test = type(schema.validate(gdf)) == gpd.GeoDataFrame
    return AssetCheckResult(
        passed=bool(test),
        severity=AssetCheckSeverity.WARN,
    )
