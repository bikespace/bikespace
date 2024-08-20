# reminder - check for TODOs

# Bikespace Analysis - Damaged Bicycle Parking Reports
# ====================================================
#
# This script takes user-submitted reports of damaged bicycle parking from the BikeSpace app and returns the nearest 5 or fewer City of Toronto bicycle parking features based on geographic proximity. The goal is to identify City bicycle parking that may need to be replaced or repaired.
#
# Source Google sheet for "BikeSpace Data Notes and Cleanup - Data.csv": [BikeSpace Data Notes and Cleanup](https://docs.google.com/spreadsheets/d/137S4d4zLhj49rEWIaaVB67UxMSU5LKMt5kIjvgYsQOU/edit?usp=sharing)

from argparse import ArgumentParser
from datetime import datetime, date
import importlib.util
import json
from pathlib import Path, PosixPath
from typing import TypedDict
from zoneinfo import ZoneInfo

import contextily as cx
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from progress.bar import Bar
import geopandas as gpd
import pytz
import requests

# GLOBAL OPTIONS
SEARCH_RADIUS = 30  # area to search, in metres

THUMBNAIL_FOLDER = Path("thumbnails")
SURVEY_PHOTO_FOLDER = Path("photos")
REFERENCE_DATA_FOLDER = Path("references")
OUTPUT_FOLDER = Path("reports")
OUTPUT_EXCEL_NAME = "damage_bikespace_city_matches"

BIKESPACE_API_URL = "https://api-dev.bikespace.ca/api/v2/submissions"
BIKESPACE_API_PAGE_SIZE = 5000

EXCLUDED_STATUSES = [
    "Resolved",
    "Invalid",
    "Needs Checking",
    "Resolution Unclear",
    "Private Property",
    "Caution",
    "App Feedback",
]


def check_xlsxwriter_installed():
    """Checks if the xlsxwriter library is installed so that the script will not error out at the end."""
    if importlib.util.find_spec("xlsxwriter") is None:
        raise Exception(
            "Please install xlxswriter (pip install xlxswriter) before running the script."
        )


def parse_date(input: str):
    if input == None:
        return None
    return datetime.strptime(input, r"%Y-%m-%d").date()


class DateRange(TypedDict):
    date_from: date
    date_to: date


def get_dates() -> DateRange:
    parser = ArgumentParser(
        description="Test description TODO; mention dates are inclusive, mention use of ISO time"
    )
    parser.add_argument(
        "-f", "--date_from", type=parse_date, help="Start Date in YYYY-MM-DD format"
    )
    parser.add_argument(
        "-t", "--date_to", type=parse_date, help="End Date in YYYY-MM-DD format"
    )
    args = parser.parse_args()

    print(args.date_from)  # TODO remove
    print(args.date_to)

    return {
        "date_from": args.date_from,
        "date_to": args.date_to,
    }


def filter_by_date(
    gdf: gpd.GeoDataFrame,
    date_column: str,
    dates: DateRange,
) -> gpd.GeoDataFrame:
    date_from = (
        dates["date_from"] if dates["date_from"] is not None else gdf[date_column].min()
    )
    date_to = (
        dates["date_to"] if dates["date_to"] is not None else gdf[date_column].max()
    )

    return gdf[(gdf[date_column] >= date_from) & (gdf[date_column] <= date_to)]


def get_bikespace_reports() -> gpd.GeoDataFrame:
    """The [BikeSpace app](https://bikespace.ca/) allows users to report issues with bicycle parking in Toronto, including parking features that are damaged. User reports can be viewed on the [BikeSpace dashboard](https://dashboard.bikespace.ca/) or downloaded via the API.

    Details on the bikespace API can be found at [api-dev.bikespace.ca](https://api-dev.bikespace.ca/api/v2/docs).
    """
    # get data
    bikespace_request = requests.get(
        BIKESPACE_API_URL,
        params={"limit": BIKESPACE_API_PAGE_SIZE},
    )
    bikespace_response = json.loads(bikespace_request.text)
    bikespace_reports_data = pd.DataFrame(bikespace_response["submissions"]).set_index(
        "id"
    )

    # convert to geodataframe
    bikespace_reports = gpd.GeoDataFrame(
        bikespace_reports_data,
        geometry=gpd.points_from_xy(
            bikespace_reports_data["longitude"],
            bikespace_reports_data["latitude"],
        ),
        crs="EPSG:4326",  # TODO check whether assumption about leaflet is true
    )

    # show a quick summary of issue types
    print("\n" + f"{len(bikespace_reports)} reports downloaded:")
    print("\n" + str(bikespace_reports["issues"].explode().value_counts()))

    # improve data display for "parking_time" field
    bikespace_reports = bikespace_reports.assign(
        parking_dt=lambda r: [
            (
                datetime.strptime(dt_string, "%a, %d %b %Y %H:%M:%S %Z")
                .replace(tzinfo=ZoneInfo("GMT"))
                .astimezone(ZoneInfo("America/Toronto"))
            )
            for dt_string in r["parking_time"]
        ]
    )
    bikespace_reports = bikespace_reports.assign(
        report_date=bikespace_reports["parking_dt"].dt.date,
        report_time=bikespace_reports["parking_dt"].dt.time,
    )

    # sort by date desc
    bikespace_reports = bikespace_reports.sort_values(
        by="parking_dt",
        axis=0,
        ascending=False,
    )

    return bikespace_reports


def get_toronto_wards() -> gpd.GeoDataFrame:
    """Get Toronto Ward Boundaries from https://open.toronto.ca/dataset/city-wards/"""
    toronto_wards = gpd.read_file(
        "https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/5e7a8234-f805-43ac-820f-03d7c360b588/resource/737b29e0-8329-4260-b6af-21555ab24f28/download/City%20Wards%20Data.geojson"
    ).rename(columns={"AREA_DESC": "WARD"})
    return toronto_wards


def get_city_sources() -> dict:
    """Source datasets from [open.toronto.ca](https://open.toronto.ca/)"""
    city_sources_path = REFERENCE_DATA_FOLDER / "open_toronto_ca_sources.json"
    with city_sources_path.open("r") as f:
        city_sources = json.load(f)
    return city_sources


def get_city_data() -> gpd.GeoDataFrame:
    city_sources = get_city_sources()

    city_data = {}
    for source in city_sources["datasets"]:
        city_data[source["dataset_name"]] = gpd.read_file(source["download_url"])
        city_data[source["dataset_name"]].insert(0, "source", source["dataset_name"])

    city_data_all = pd.concat(city_data.values())
    return city_data_all


def save_thumbnail(entry, folder) -> PosixPath:
    """Saves a thumbnail using geodataframe.plot() if it doesn't already exist

    returns the relative posix path to the saved thumbnail
    """
    with plt.ioff():  # turn off matplotlib output
        # get geodataframes and convert to Web mercator (unit = metres)
        gdf_bs = entry["report"].to_crs(epsg=3857)
        gdf_city = entry["city_features"].to_crs(epsg=3857)

        bs_id = gdf_bs.squeeze().name
        thumbnail_path = Path(folder) / f"{bs_id}.jpg"
        if not thumbnail_path.exists():
            # generate plots
            ax_city = gdf_city.plot(
                figsize=(8, 8),
                markersize=200,
                edgecolor="white",
                linewidth=2,
            )
            pad = 75  # additional metres of map to show around bounds of features
            _x = gdf_bs.squeeze().geometry.x
            _y = gdf_bs.squeeze().geometry.y
            ax_city.set_xlim(_x - pad, _x + pad)
            ax_city.set_ylim(_y - pad, _y + pad)
            ax_bs = gdf_bs.plot(
                figsize=(8, 8),
                ax=ax_city,
                marker="^",  # triangle
                markersize=400,
                edgecolor="white",
                linewidth=2,
            )

            # add basemap and remove axis labels
            cx.add_basemap(
                ax_bs, crs=gdf_bs.crs, zoom=19, source=cx.providers.OpenStreetMap.Mapnik
            )
            ax_bs.set_axis_off()  # remove x and y axes from plot

            # save to file
            Path(folder).mkdir(exist_ok=True)  # make folder if it doesn't exist
            ax_bs.figure.savefig(thumbnail_path, bbox_inches="tight")
            plt.close()

        return (Path(folder) / f"{bs_id}.jpg").as_posix()


def export_excel(
    report_city_matches, report_matches_unique, matched_city_features_unique
):
    city_sources = get_city_sources()

    # set up output folder
    TODAY_ISO = datetime.today().strftime(r"%Y-%m-%d")
    REPORT_FOLDER = OUTPUT_FOLDER / TODAY_ISO
    REPORT_FOLDER.mkdir(exist_ok=True)

    # set up output excel sheet
    writer = pd.ExcelWriter(
        REPORT_FOLDER / f"{OUTPUT_EXCEL_NAME}_{TODAY_ISO}.xlsx",
        engine="xlsxwriter",
    )
    workbook = writer.book
    bold = workbook.add_format({"bold": True, "text_wrap": False})
    text_wrap = workbook.add_format({"text_wrap": True})
    no_text_wrap = workbook.add_format({"text_wrap": False})

    # TAB 0 - INSTRUCTIONS PAGE
    worksheet = workbook.add_worksheet("Notes")
    writer.sheets["Matches"] = worksheet

    content = [
        ("Bikespace Analysis - Damaged Bicycle Parking Reports", bold),
        (f"Updated {datetime.today().strftime('%B %d %Y')}", no_text_wrap),
        (
            f"{len(report_city_matches)} BikeSpace damage reports with nearby City bicycle parking features",
            no_text_wrap,
        ),
        (""),
        ("NOTES", bold),
        (" • Coordinate reference system for lat/long values is WGS84 (EPSG:4326)"),
        (" • For any questions about this sheet, please contact bikespaceto@gmail.com"),
        (""),
        ("TABS", bold),
        (
            " • Matches: display of damaged bicycle parking reports alongside nearby City of Toronto parking features"
        ),
        ("    Damage reports are ordered by date descending (most recent first)"),
        (
            f"    City features include top 5 nearest bicycle parking features within a {SEARCH_RADIUS}m radius"
        ),
        ("    Damage report listed first, then data from applicable City features"),
        ("    Thumbnail maps: orange triangle is location of damage report"),
        ("    blue dots are locations of nearest 5 City bicycle parking features"),
        (" • DamageReports: data table for damaged bicycle parking reports"),
        (
            " • CityFeatures: data table for City of Toronto parking features matched with damage reports"
        ),
        ("    (Note that the same features may be listed more than once)"),
        (""),
        ("SOURCES", bold),
        (
            "User reports of damaged bicycle parking are from the BikeSpace app (bikespace.ca)"
        ),
        (
            "BikeSpace damage reports are checked for data quality and omit known test entries, duplicates, and reports not on City property."
        ),
        ("City of Toronto bicycle parking features are from the following datasets:"),
        *[(" • " + source["dataset_title"]) for source in city_sources["datasets"]],
    ]

    for i, line in enumerate(content):
        try:
            (text, format) = line
        except:
            (text) = line
            format = None
        worksheet.write(i, 0, text, format)

    worksheet.fit_to_pages(1, 0)

    # TAB 1 - DISPLAY OF REPORTS AND MATCHES
    worksheet = workbook.add_worksheet("Matches")
    writer.sheets["Matches"] = worksheet
    pagebreaks = []
    images = []

    # set column widths to 18 and format to word wrap
    worksheet.set_column("A:F", 18, text_wrap)

    # write header content
    worksheet.write("A1", *content[0])
    worksheet.write("A2", *content[1])
    worksheet.write("A3", *content[2])

    # write data tables
    write_row = 4
    for pair in report_city_matches:
        report, city_features, thumbnail = pair.values()
        worksheet.insert_image(
            write_row,
            0,
            thumbnail,
            {"x_scale": 0.5, "y_scale": 0.5, "object_position": 2},
        )
        write_row += 15 + 1  # 15 is approx size of image, 1 is blank row
        report = (
            report.reset_index(names=["id"])
            .drop(columns=["geometry", "parking_time", "parking_dt"])
            .T.dropna(how="all")
        )
        city_features = (
            city_features.drop(columns=["bikespace_id", "geometry"])
            .T.replace(0, np.nan)
            .replace("", np.nan)
            .dropna(how="all")
        )
        report.to_excel(
            writer,
            sheet_name="Matches",
            startrow=write_row,
            startcol=0,
            header=False,
        )
        write_row += len(report) + 1
        city_features.to_excel(
            writer,
            sheet_name="Matches",
            startrow=write_row,
            startcol=0,
            header=False,
        )
        write_row += len(city_features) + 2
        pagebreaks.append(write_row)

    # TAB 2 - BIKESPACE REPORTS
    worksheet = workbook.add_worksheet("DamageReports")
    writer.sheets["DamageReports"] = worksheet

    # write header content
    worksheet.write("A1", "Damaged Bicycle Parking Reports", bold)
    damage_reports = report_matches_unique.drop(
        columns=["geometry", "parking_time", "parking_dt"]
    ).reset_index()
    damage_reports.to_excel(
        writer,
        sheet_name="DamageReports",
        startrow=2,
        startcol=0,
        header=True,
        index=False,
    )

    # formatting
    (max_row, max_col) = damage_reports.shape
    column_settings = [{"header": column} for column in damage_reports.columns]
    worksheet.add_table(
        2,
        0,
        max_row + 2,
        max_col - 1,
        {
            "name": "T_DamageReports",
            "columns": column_settings,
            "style": "Table Style Light 8",
        },
    )

    worksheet.set_column(0, max_col, 15, text_wrap)
    worksheet.set_column("B:B", 40, text_wrap)
    worksheet.set_column("H:I", 20, text_wrap)

    # print formatting
    worksheet.set_h_pagebreaks(pagebreaks[0:-1])
    worksheet.print_area(0, 0, write_row, 5)
    worksheet.fit_to_pages(1, 0)  # fit to one column

    # TAB 3 - MATCHED CITY BICYCLE PARKING FEATURES
    worksheet = workbook.add_worksheet("CityFeatures")
    writer.sheets["CityFeatures"] = worksheet
    # write header content
    worksheet.write("A1", "Matched City Bicycle Parking Features", bold)
    city_features_output = (
        matched_city_features_unique.drop(columns=["geometry"])
        .replace(0, np.nan)
        .replace("", np.nan)
        .dropna(axis=1, how="all")
    )
    city_features_output.to_excel(
        writer,
        sheet_name="CityFeatures",
        startrow=2,
        startcol=0,
        header=True,
        index=False,
    )

    # formatting
    (max_row, max_col) = city_features_output.shape
    column_settings = [{"header": column} for column in city_features_output.columns]
    worksheet.add_table(
        2,
        0,
        max_row + 2,
        max_col - 1,
        {
            "name": "T_CityFeatures",
            "columns": column_settings,
            "style": "Table Style Light 8",
        },
    )

    worksheet.set_column(0, max_col, 15, text_wrap)

    workbook.close()


def generate_report():
    check_xlsxwriter_installed()

    date_range = get_dates()
    bikespace_reports = get_bikespace_reports()
    toronto_wards = get_toronto_wards()
    city_data = get_city_data()

    bs_quality_check = pd.read_csv(
        REFERENCE_DATA_FOLDER / "BikeSpace Data Notes and Cleanup - Data.csv"
    ).set_index("id")
    bikespace_reports = bikespace_reports.join(
        bs_quality_check[
            [
                "Status",
                "Notes",
                "Survey_Date",
                "Asset",
                "Check_311_Date",
                "Check_311_Notes",
                "City_Problem_Type",
            ]
        ],
        on="id",
        how="left",
    )

    # filter reports
    exclude_by_status = [
        status not in EXCLUDED_STATUSES for status in bikespace_reports["Status"]
    ]
    bikespace_reports = bikespace_reports[exclude_by_status].drop(columns=["Status"])
    # TODO add in date filter
    br_toronto = bikespace_reports.sjoin(
        toronto_wards[["geometry", "WARD"]],
        how="left",
        predicate="intersects",
    ).drop(
        "index_right", axis=1
    )  # TODO is this drop needed?
    br_toronto_damaged = br_toronto[["damaged" in i for i in br_toronto["issues"]]]

    print("\nOutside of Toronto IDs:")
    print(br_toronto_damaged[br_toronto_damaged["WARD"].isna()].index)
    br_toronto_damaged = br_toronto_damaged[~br_toronto_damaged["WARD"].isna()]

    # show a quick summary of filtered reports
    print("\n" + f"{len(br_toronto_damaged)} filtered reports:")
    print("\n" + str(br_toronto_damaged["issues"].explode().value_counts()))

    # convert crs to allow for distance calculations in metres
    br_toronto_damaged_utm17n = br_toronto_damaged.to_crs("32617")
    city_data_all_utm17n = city_data.to_crs("32617")

    br_toronto_damaged_utm17n = br_toronto_damaged_utm17n.assign(
        geometry_buffered=br_toronto_damaged_utm17n.buffer(SEARCH_RADIUS)
    )

    data_matches = city_data_all_utm17n.sjoin(
        df=(
            br_toronto_damaged_utm17n[["geometry_buffered"]].set_geometry(
                "geometry_buffered"
            )
        ),
        how="inner",
        predicate="intersects",
    )

    report_matches = gpd.GeoDataFrame(
        [br_toronto_damaged_utm17n.loc[i] for i in data_matches["id"]],
        crs="32617",  # UTM 17N
    )

    distances = data_matches["geometry"].distance(report_matches, align=False)
    data_matches = data_matches.assign(distance=distances)
    # reorder columns
    left_columns = [
        "distance",
        "id",
        "source",
        "ID",
        "OBJECTID",
        "ADDRESSNUMBERTEXT",
        "ADDRESSSTREET",
        "FRONTINGSTREET",
        "SIDE",
        "FROMSTREET",
        "DIRECTION",
        "SITEID",
        "WARD",
        "BIA",
        "ASSETTYPE",
        "STATUS",
        "SDE_STATE_ID",
    ]
    data_matches = data_matches[
        left_columns + [col for col in data_matches.columns if col not in left_columns]
    ]
    data_matches = (
        data_matches.to_crs(4326)  # WGS 84
        .explode(index_parts=False)  # convert multipoint to point
        .assign(
            latitude=lambda r: [y for y in r.geometry.y],
            longitude=lambda r: [x for x in r.geometry.x],
        )
        .drop(columns=["_id"])
        .rename(columns={"id": "bikespace_id"})
    )

    report_matches_unique = (
        report_matches[~report_matches.index.duplicated(keep="first")]
        .drop(columns=["geometry_buffered"])
        .sort_values(
            by="parking_dt",
            axis=0,
            ascending=False,
        )
        .assign(
            url=lambda x: [
                f"https://dashboard.bikespace.ca/#feed?view_all=1&submission_id={id}"
                for id in x.index
            ]
        )
        .to_crs(4326)  # WGS 84
    )

    # organize BikeSpace damage reports alongside top 5 nearest city parking features
    report_city_matches = []

    for ix in report_matches_unique.index:
        report_city_matches.append(
            {
                "report": report_matches_unique.loc[[ix]],
                "city_features": data_matches[
                    data_matches["bikespace_id"] == ix
                ].nsmallest(n=5, columns="distance"),
            }
        )

    bar = Bar("Saving Thumbnails", max=len(report_city_matches))
    for entry in report_city_matches:
        entry["thumbnail"] = save_thumbnail(entry, THUMBNAIL_FOLDER)
        bar.next()
    bar.finish()

    matched_city_features_unique = pd.concat(
        [df["city_features"] for df in report_city_matches]
    )

    export_excel(
        report_city_matches, report_matches_unique, matched_city_features_unique
    )


if __name__ == "__main__":
    generate_report()
