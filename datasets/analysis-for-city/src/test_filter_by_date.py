from datetime import datetime

import geopandas as gpd

from .generate_damage_report import filter_by_date, DateRange

test_dates = [
    "Thu, 15 Aug 2024 18:00:00 GMT",
    "Fri, 16 Aug 2024 00:00:00 GMT",
    "Fri, 16 Aug 2024 23:59:59 GMT",
    "Sat, 17 Aug 2024 00:00:00 GMT",
    "Sat, 17 Aug 2024 23:59:59 GMT",
    "Sun, 18 Aug 2024 17:10:00 GMT",
]

gdf = gpd.GeoDataFrame().assign(
    submission_date=[
        datetime.strptime(x, "%a, %d %b %Y %H:%M:%S %Z").date() for x in test_dates
    ]
)


def run_test(date_from: str, date_to: str, num_results: int):
    dates: DateRange = {
        "date_from": (
            None if date_from is None else datetime.strptime(date_from, "%Y-%m-%d").date()
        ),
        "date_to": None if date_to is None else datetime.strptime(date_to, "%Y-%m-%d").date(),
    }
    filtered_gdf = filter_by_date(gdf, "submission_date", dates)
    assert len(filtered_gdf) == num_results


def test_one_day_range():
    run_test("2024-08-16", "2024-08-16", 2)


def test_multi_day_range():
    run_test("2024-08-16", "2024-08-17", 4)


def test_start_only():
    run_test("2024-08-16", None, 5)


def test_end_only():
    run_test(None, "2024-08-16", 3)


def test_no_range():
    run_test(None, None, 6)
