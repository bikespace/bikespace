from datetime import datetime, timezone


from analysis_for_city.generate_damage_report import parse_date_bikespace_api

test_dates = [
    (
        "2024-09-20T01:00:00",
        datetime(2024, 9, 20, 1, 0, 0, tzinfo=timezone.utc),
    ),  # newer entries
    (
        "2024-09-20T03:28:24.632000",
        datetime(2024, 9, 20, 3, 28, 24, tzinfo=timezone.utc),
    ),  # older entries
]


def test_api_date_parse():
    for date_string, date_value in test_dates:
        parsed = parse_date_bikespace_api(date_string)
        assert parsed == date_value
