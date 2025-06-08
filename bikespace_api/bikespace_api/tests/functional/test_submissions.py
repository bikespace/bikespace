import json
from datetime import datetime, timezone

from pytest import mark

from bikespace_api.api.models import IssueType, ParkingDuration, Submission


def test_get_submissions(test_client):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/api/v2/submissions' page is requested (GET)
    THEN check that the response is Valid
    """
    response = test_client.get("/api/v2/submissions")
    res = json.loads(response.get_data())
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/json"
    assert all(k in res for k in ("pagination", "submissions"))
    assert isinstance(res["pagination"], dict)
    assert isinstance(res["submissions"], list)


def test_get_submissions_accept_json(test_client):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/api/v2/submissions' page is requested (GET)
    THEN check that the response is Valid
    """
    accept_header = {"Accept": "application/json"}
    response = test_client.get("/api/v2/submissions", headers=accept_header)
    res = json.loads(response.get_data())
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/json"
    assert all(k in res for k in ("pagination", "submissions"))
    assert isinstance(res["pagination"], dict)
    assert isinstance(res["submissions"], list)


def test_get_submissions_accept_geojson(test_client):
    accept_header = {"Accept": "application/geo+json"}
    response = test_client.get("/api/v2/submissions", headers=accept_header)
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/geo+json"


def test_get_submission_accept_csv(test_client):
    accept_header = {"Accept": "text/csv"}
    response = test_client.get("/api/v2/submissions", headers=accept_header)
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "text/csv"


def test_get_submissions_with_offset_limit(test_client):
    target_limit = 2
    response = test_client.get(f"/api/v2/submissions?offset=1&limit={target_limit}")
    res = json.loads(response.get_data())
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/json"
    assert all(k in res for k in ("pagination", "submissions"))
    assert isinstance(res["pagination"], dict)
    assert isinstance(res["submissions"], list)
    assert len(res["submissions"]) == target_limit


@mark.parametrize("target_id", [1, 4])
def test_get_submissions_with_id(test_client, target_id):
    response = test_client.get(f"/api/v2/submissions/{target_id}")
    res = json.loads(response.get_data())
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/json"
    assert all(
        k in res
        for k in (
            "id",
            "latitude",
            "longitude",
            "issues",
            "parking_duration",
            "parking_time",
            "comments",
            "submitted_datetime",
        )
    )
    assert res["id"] == target_id
    assert isinstance(res["latitude"], float)
    assert isinstance(res["longitude"], float)
    assert isinstance(res["issues"], list)
    assert isinstance(res["parking_duration"], str)
    assert isinstance(res["parking_time"], str)
    assert isinstance(res["comments"], str)
    assert isinstance(res["submitted_datetime"], (type(None), str))


@mark.uses_db
def test_post_submissions(test_client, submission_id=5):
    dummy_submission = {
        "latitude": 43.6532,
        "longitude": -79.3832,
        "issues": ["full"],
        "parking_duration": "minutes",
        "parking_time": "2023-08-19 15:17:17.234235",
        "comments": "test1",
    }
    response = test_client.post("/api/v2/submissions", json=dummy_submission)
    current_datetime = datetime.now(timezone.utc)
    new_submission = Submission.query.filter_by(id=submission_id).first()
    assert response.status_code == 201
    assert new_submission.id == submission_id
    assert new_submission.latitude == dummy_submission["latitude"]
    assert new_submission.longitude == dummy_submission["longitude"]
    assert new_submission.issues == [
        IssueType(issue) for issue in dummy_submission["issues"]
    ]
    assert new_submission.parking_duration == ParkingDuration(
        dummy_submission["parking_duration"]
    )
    assert new_submission.parking_time == datetime.strptime(
        dummy_submission["parking_time"], "%Y-%m-%d %H:%M:%S.%f"
    )
    assert new_submission.comments == dummy_submission["comments"]
    assert (current_datetime - new_submission.submitted_datetime).total_seconds() < 1
