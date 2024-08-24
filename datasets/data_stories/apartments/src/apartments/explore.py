from apartments.torontoopendata import request_tod_df

import pandera as pa


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

    return vdf


def get_building_evaluations():
    df, meta = request_tod_df(
        dataset_name="apartment-building-evaluation",
        resource_id="7fa98ab2-7412-43cd-9270-cb44dd75b573",
    ).values()

    schema = pa.DataFrameSchema(
        {
            "RSN": pa.Column("int64", required=True, unique=True),
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
    vdf = schema.validate(df, lazy=True)

    return vdf


def get_bike_parking_info():
    building_registrations = get_building_registrations()
    building_evaluations = get_building_evaluations()
    joined = building_registrations.merge(
        building_evaluations, how="left", on="RSN")

    breakpoint()


if __name__ == "__main__":
    get_bike_parking_info()
