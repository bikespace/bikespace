import math
from pathlib import Path
from typing import TypedDict

import geopandas as gpd
import pandas as pd
import pandera as pa

from apartments.torontoopendata import request_tod_df, request_tod_gdf


class ZoningRequirements(TypedDict):
    short_term_min: int
    short_term_max: int
    long_term: int


def get_building_registrations():
    df, meta = request_tod_df(
        dataset_name="apartment-building-registration",
        resource_id="97b8b7a4-baca-49c7-915d-335322dbcf95",
    ).values()

    schema = pa.DataFrameSchema(
        {
            "BIKE_PARKING": pa.Column(str, required=True),
            "CONFIRMED_STOREYS": pa.Column("int64"),
            "CONFIRMED_UNITS": pa.Column("int64"),
            "PROP_MANAGEMENT_COMPANY_NAME": pa.Column(str, nullable=True),
            "PROPERTY_TYPE": pa.Column(
                str,
                nullable=True,
                checks=pa.Check.isin(["PRIVATE", "TCHC", "SOCIAL HOUSING"]),
            ),
            "RSN": pa.Column("int64", required=True, unique=True),
            "SITE_ADDRESS": pa.Column(str, required=True),
            "WARD": pa.Column(str),
            "YEAR_BUILT": pa.Column("int64", nullable=True),
            "YEAR_OF_REPLACEMENT": pa.Column("int64", nullable=True),
            "YEAR_REGISTERED": pa.Column("int64", nullable=True),
        },
        strict="filter",
    )
    vdf = schema.validate(df, lazy=True)

    BIKE_PARKING_PATTERN = r"(?P<bike_parking_indoor>\d+) indoor parking spots and (?P<bike_parking_outdoor>\d+) outdoor parking spots"
    bike_parking_matches = vdf["BIKE_PARKING"].str.extract(
        BIKE_PARKING_PATTERN)
    vdf = vdf.join(bike_parking_matches)
    vdf["bike_parking_indoor"] = pd.to_numeric(vdf["bike_parking_indoor"])
    vdf["bike_parking_outdoor"] = pd.to_numeric(vdf["bike_parking_outdoor"])

    return vdf


def get_building_evaluations():
    df_2023_plus, meta_2023_plus = request_tod_df(
        dataset_name="apartment-building-evaluation",
        resource_id="7fa98ab2-7412-43cd-9270-cb44dd75b573",
    ).values()

    schema_2023_plus = pa.DataFrameSchema(
        {
            "RSN": pa.Column("int64", required=True),
            "SITE ADDRESS": pa.Column(str, required=True),
            "LATITUDE": pa.Column("float64", nullable=True),
            "LONGITUDE": pa.Column("float64", nullable=True),
            "X": pa.Column("float64", nullable=True),
            "Y": pa.Column("float64", nullable=True),
        },
        strict="filter",
        # Ensure that each entry has either a valid lat/long or x/y
        checks=[
            pa.Check(lambda df: ~(df["LONGITUDE"].isna() & df["X"].isna())),
            pa.Check(lambda df: ~(df["LATITUDE"].isna() & df["Y"].isna())),
        ],
    )
    vdf_2023_plus = schema_2023_plus.validate(df_2023_plus, lazy=True).rename(
        columns={"SITE ADDRESS": "SITE_ADDRESS"}
    )

    df_prior, meta_prior = request_tod_df(
        dataset_name="apartment-building-evaluation",
        resource_id="979fb513-5186-41e9-bb23-7b5cc6b89915",
    ).values()

    schema_prior = pa.DataFrameSchema(
        {
            "RSN": pa.Column("int64", required=True),
            "SITE_ADDRESS": pa.Column(str, required=True),
            "LATITUDE": pa.Column("float64", nullable=True),
            "LONGITUDE": pa.Column("float64", nullable=True),
            "X": pa.Column("float64", nullable=True),
            "Y": pa.Column("float64", nullable=True),
        },
        strict="filter",
        # Ensure that each entry has either a valid lat/long or x/y
        checks=[
            pa.Check(lambda df: ~(df["LONGITUDE"].isna() & df["X"].isna())),
            pa.Check(lambda df: ~(df["LATITUDE"].isna() & df["Y"].isna())),
        ],
        # drop rows that fail validation
        drop_invalid_rows=True,
    )
    vdf_prior = schema_prior.validate(df_prior, lazy=True)

    df_all = (
        pd.concat([vdf_2023_plus, vdf_prior])
        .groupby("RSN")
        .agg(
            {
                "SITE_ADDRESS": "first",
                "LATITUDE": "median",
                "LONGITUDE": "median",
                "X": "median",
                "Y": "median",
            }
        )
    )

    schema_all = pa.DataFrameSchema(
        # Ensure that each entry has either a valid lat/long or x/y
        checks=[
            pa.Check(lambda df: ~(df["LONGITUDE"].isna() & df["X"].isna())),
            pa.Check(lambda df: ~(df["LATITUDE"].isna() & df["Y"].isna())),
        ],
    )
    vdf_all = schema_prior.validate(df_all, lazy=True)

    xy_converted = gpd.GeoSeries.from_xy(
        x=vdf_all["X"],
        y=vdf_all["Y"],
        index=vdf_all.index,
        crs="EPSG:7991",  # MTM Zone 10 NAD27 EPSG:7991 - see https://www.toronto.ca/city-government/data-research-maps/maps/purchase-maps-data/mapping-glossary/
    ).to_crs("EPSG:4326")

    vdf_all["LONGITUDE"] = vdf_all["LONGITUDE"].fillna(xy_converted.x)
    vdf_all["LATITUDE"] = vdf_all["LATITUDE"].fillna(xy_converted.y)

    output = vdf_all.drop(columns=["X", "Y"])
    return output


def calculate_zoning_requirement(row) -> ZoningRequirements:
    """Calculate the required number of bicycle parking spaces under the current zoning by-law using the BICYCLE_ZONE and CONFIRMED_UNITS columns"""

    unit_multipliers: dict = {}
    if pd.isna(row["BICYCLE_ZONE"]) or pd.isna(row["CONFIRMED_UNITS"]):
        return {
            "short_term_min": pd.NA,
            "short_term_max": pd.NA,
            "long_term": pd.NA,
        }
    if row["BICYCLE_ZONE"] == 1:
        unit_multipliers["short_term"] = 0.2
        unit_multipliers["long_term"] = 0.9
    elif row["BICYCLE_ZONE"] == 2:
        unit_multipliers["short_term"] = 0.07
        unit_multipliers["long_term"] = 0.68

    # requirement is rounded up to nearest whole number
    short_term_req = math.ceil(
        unit_multipliers["short_term"] * row["CONFIRMED_UNITS"])
    long_term_req = math.ceil(
        unit_multipliers["long_term"] * row["CONFIRMED_UNITS"])

    return {
        # payment in lieu allows for 50% reduction in short term; reduction amount is rounded down (i.e. total is rounded up after dividing by two)
        "short_term_min": math.ceil(short_term_req / 2),
        "short_term_max": short_term_req,
        "long_term": long_term_req,
    }


def get_wards_gdf() -> gpd.GeoDataFrame:
    """Retrieves, simplifies, and saves data from the City Wards dataset from open.toronto.ca"""

    wards = request_tod_gdf(
        dataset_name="city-wards",
        resource_id="737b29e0-8329-4260-b6af-21555ab24f28",
    )
    wards_formatted = (
        wards["gdf"][["AREA_SHORT_CODE", "AREA_NAME", "geometry"]]
        .assign(
            ward_full=[
                f"{x.AREA_NAME} ({x.AREA_SHORT_CODE})"
                for x in wards["gdf"].itertuples()
            ]
        )
        .rename(
            columns={
                "AREA_SHORT_CODE": "ward_code",
                "AREA_NAME": "ward_name",
            }
        )
    )
    return wards_formatted


def get_neighbourhoods_gdf() -> gpd.GeoDataFrame:
    "Retrieves and simplifies from https://open.toronto.ca/dataset/neighbourhoods/"
    gdf, meta = request_tod_gdf(
        dataset_name="neighbourhoods",
        resource_id="1d38e8b7-65a8-4dd0-88b0-ad2ce938126e",
    ).values()
    gdf_formatted = gdf[
        [
            "AREA_SHORT_CODE",
            "AREA_NAME",
            "CLASSIFICATION",
            "CLASSIFICATION_CODE",
            "geometry",
        ]
    ].rename(
        columns={
            "AREA_SHORT_CODE": "neighbourhood_number",
            "AREA_NAME": "neighbourhood_name",
            "CLASSIFICATION": "neighbourhood_classification",
            "CLASSIFICATION_CODE": "neighbourhood_classification_code",
        }
    )
    return gdf_formatted


def get_bike_parking_info():
    building_registrations = get_building_registrations()
    building_evaluations = get_building_evaluations()
    joined = building_registrations.merge(
        building_evaluations, how="left", on="RSN")
    gdf = gpd.GeoDataFrame(
        joined,
        geometry=gpd.GeoSeries.from_xy(
            x=joined["LONGITUDE"], y=joined["LATITUDE"], crs="EPSG:4326"
        ),
    )

    # need to geocode missing

    # add city wards
    wards = get_wards_gdf()
    gdf_with_wards = gdf.sjoin(wards, how="left").drop(columns=["index_right"])

    # add city neighbourhoods
    neighbourhoods = get_neighbourhoods_gdf()
    gdf_with_neighbourhoods = gdf_with_wards.sjoin(neighbourhoods, how="left").drop(
        columns=["index_right"]
    )

    # add city bicycle parking zoning policy areas
    bicycle_parking_zones = gpd.GeoDataFrame.from_file(
        Path("") / "source_data" / "Toronto_Bicycle_Policy_Zones.geojson"
    )
    gdf_with_zones = gdf_with_neighbourhoods.sjoin(
        bicycle_parking_zones, how="left"
    ).drop(columns=["index_right"])

    gdf_with_zoning_reqs = gdf_with_zones.assign(
        zoning_reqs=gdf_with_zones[["BICYCLE_ZONE", "CONFIRMED_UNITS"]].apply(
            calculate_zoning_requirement, axis=1
        )
    )
    gdf_split_zoning_reqs = pd.concat(
        [gdf_with_zoning_reqs, pd.json_normalize(
            gdf_with_zoning_reqs["zoning_reqs"])],
        axis=1,
    ).drop(columns=["zoning_reqs"])

    gdf_unmet_need = gdf_split_zoning_reqs.assign(
        short_term_min_unmet=gdf_split_zoning_reqs["short_term_min"]
        - gdf_split_zoning_reqs["bike_parking_outdoor"].fillna(0),
        short_term_max_unmet=gdf_split_zoning_reqs["short_term_max"]
        - gdf_split_zoning_reqs["bike_parking_outdoor"].fillna(0),
        long_term_unmet=gdf_split_zoning_reqs["long_term"]
        - gdf_split_zoning_reqs["bike_parking_indoor"].fillna(0),
    ).convert_dtypes()

    gdf_unmet_need["total_unmet_min"] = (
        gdf_unmet_need["short_term_min_unmet"] +
        gdf_unmet_need["long_term_unmet"]
    )
    gdf_unmet_need["total_req_min"] = (
        gdf_unmet_need["short_term_min"] + gdf_unmet_need["long_term"]
    )
    gdf_unmet_need["pc_unmet"] = (
        gdf_unmet_need["total_unmet_min"] / gdf_unmet_need["total_req_min"]
    )

    # output
    gdf_unmet_need.to_file(
        "apartments_bicycle_parking.geojson", driver="geojson")
    gdf_unmet_need.to_csv("apartments_bicycle_parking.csv")


if __name__ == "__main__":
    get_bike_parking_info()
