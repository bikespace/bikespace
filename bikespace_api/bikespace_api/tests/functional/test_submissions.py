import json
from datetime import datetime, timezone

from bikespace_api.api.models import IssueType, ParkingDuration, Submission
from pytest import mark

from bikespace_api import db  # type: ignore


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
    assert type(res["pagination"]) == dict
    assert type(res["submissions"]) == list


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
    assert type(res["pagination"]) == dict
    assert type(res["submissions"]) == list


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
    assert type(res["pagination"]) == dict
    assert type(res["submissions"]) == list
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
    assert type(res["latitude"]) == float
    assert type(res["longitude"]) == float
    assert type(res["issues"]) == list
    assert type(res["parking_duration"]) == str
    assert type(res["parking_time"]) == str
    assert type(res["comments"]) == str
    assert type(res["submitted_datetime"]) in (type(None), str)


@mark.uses_db
def test_post_submissions(flask_app, test_client, submission_id=5):
    dummy_submission = {
        "latitude": 43.6532,
        "longitude": -79.3832,
        "issues": ["full"],
        "parking_duration": "minutes",
        "parking_time": "2023-08-19 15:17:17.234235",
        "comments": "test1",
    }

    with flask_app.app_context():
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


def test_get_submission_history(flask_app, test_client):
    """
    GIVEN a Flask application and a Submission entry configured for testing
    GIVEN database actions for that Submission to create, update, and delete
    WHEN the '/api/v2/submissions/{submission_id}/history' data is requested (GET)
    THEN check that the response is valid for each of the create, update, and delete actions
    """
    with flask_app.app_context():
        # create a new submission for testing
        initial_comment = "history test - create"
        db.session.add(
            Submission(
                43.1234,
                -79.1234,
                [IssueType.ABANDONDED],
                ParkingDuration.MINUTES,
                datetime.now(),
                initial_comment,
            )
        )
        db.session.commit()
        test_submission = Submission.query.filter_by(comments=initial_comment).first()
        submission_id = test_submission.id

        # request the edit history - should show one create action
        response_create = test_client.get(
            f"/api/v2/submissions/{submission_id}/history"
        )
        result_create = json.loads(response_create.get_data())
        assert response_create.status_code == 200
        assert response_create.headers["Content-Type"] == "application/json"
        assert len(result_create) == 1
        assert all(k in result_create[0] for k in ("operation_type", "changes"))
        assert result_create[0]["operation_type"] == 0  # create action
        assert len(result_create[0]["changes"]) > 0

        # modify a property - should show an additional update action
        test_submission.comments = "history test - update"
        db.session.commit()

        response_update = test_client.get(
            f"/api/v2/submissions/{submission_id}/history"
        )
        result_update = json.loads(response_update.get_data())
        assert response_update.status_code == 200
        assert response_update.headers["Content-Type"] == "application/json"
        assert len(result_update) == 2
        assert all(k in result_update[1] for k in ("operation_type", "changes"))
        assert result_update[1]["operation_type"] == 1  # update action
        assert len(result_update[1]["changes"]) == 1  # update to comment only

        # delete the submission - should show an additional delete action
        # confirms that the view queries on the history table, since the submission table will not return a result for a deleted entry
        db.session.delete(test_submission)
        db.session.commit()

        response_delete = test_client.get(
            f"/api/v2/submissions/{submission_id}/history"
        )
        result_delete = json.loads(response_delete.get_data())

        assert response_delete.status_code == 200
        assert response_delete.headers["Content-Type"] == "application/json"
        assert len(result_delete) == 3
        assert all(k in result_delete[2] for k in ("operation_type", "changes"))
        assert result_delete[2]["operation_type"] == 2  # delete action
        assert (
            len(result_delete[2]["changes"]) == 0
        )  # no changes for delete action since it applies record-wide
