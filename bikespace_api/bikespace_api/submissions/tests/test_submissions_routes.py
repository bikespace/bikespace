import json
from datetime import datetime, timezone
from http import HTTPStatus
from unittest.mock import patch

import pytest
from bikespace_api.submissions.submissions_models import (
    IssueType,
    ParkingDuration,
    Submission,
)
from bikespace_api.submissions.submissions_routes import OperationType
from sqlalchemy.exc import IntegrityError as SaIntegrityError
from sqlalchemy_continuum import version_class, count_versions

from bikespace_api import db  # type: ignore


@pytest.fixture()
def dummy_submission():
    return {
        "latitude": 43.6532,
        "longitude": -79.3832,
        "issues": ["full"],
        "parking_duration": "minutes",
        "parking_time": "2023-08-19 15:17:17.234235",
        "comments": "test1",
    }


class TestGetSubmissions:
    "Tests for GET /api/v2/submissions"

    def test_get_submissions(self, test_client):
        """
        GIVEN a Flask application configured for testing
        WHEN GET '/api/v2/submissions' page is requested
        THEN check that the response is valid
        """
        response = test_client.get("/api/v2/submissions")
        assert response.status_code == HTTPStatus.OK
        assert response.headers["Content-Type"] == "application/json"
        assert all(k in response.json for k in ("pagination", "submissions"))
        assert isinstance(response.json["pagination"], dict)
        assert isinstance(response.json["submissions"], list)

    def test_get_submissions_accept_json(self, test_client):
        """
        GIVEN a Flask application configured for testing
        WHEN GET '/api/v2/submissions' page is requested
        THEN check that the response is valid
        """
        accept_header = {"Accept": "application/json"}
        response = test_client.get("/api/v2/submissions", headers=accept_header)
        response = test_client.get("/api/v2/submissions")
        assert response.status_code == HTTPStatus.OK
        assert response.headers["Content-Type"] == "application/json"
        assert all(k in response.json for k in ("pagination", "submissions"))
        assert isinstance(response.json["pagination"], dict)
        assert isinstance(response.json["submissions"], list)

    def test_get_submissions_accept_geojson(self, test_client):
        """
        GIVEN a Flask application configured for testing
        WHEN GET '/api/v2/submissions' page is requested with mimetype "application/geo+json"
        THEN check that the response is valid
        """
        accept_header = {"Accept": "application/geo+json"}
        response = test_client.get("/api/v2/submissions", headers=accept_header)
        assert response.status_code == HTTPStatus.OK
        assert response.headers["Content-Type"] == "application/geo+json"

    def test_get_submissions_geojson_empty_db(self, flask_app, test_client):
        """
        GIVEN a Flask application configured for testing
        WHEN the GeoJSON submissions endpoint is requested with no submissions in the DB
        THEN check that the response is an empty GeoJSON FeatureCollection
        """
        with flask_app.app_context():
            with patch(
                "bikespace_api.submissions.submissions_routes.Submission.query"
            ) as mock_query:
                mock_query.all.return_value = []
                response = test_client.get(
                    "/api/v2/submissions",
                    headers={"Accept": "application/geo+json"},
                )
        assert response.status_code == HTTPStatus.OK
        assert response.headers["Content-Type"] == "application/geo+json"
        data = json.loads(response.get_data())
        assert data["type"] == "FeatureCollection"
        assert data["features"] == []

    def test_get_submission_accept_csv(self, test_client):
        """
        GIVEN a Flask application configured for testing
        WHEN GET '/api/v2/submissions' page is requested with mimetype "text/csv"
        THEN check that the response is valid
        """
        accept_header = {"Accept": "text/csv"}
        response = test_client.get("/api/v2/submissions", headers=accept_header)
        assert response.status_code == HTTPStatus.OK
        assert response.mimetype == "text/csv"

    def test_get_submissions_with_offset_limit(self, test_client):
        """
        GIVEN a Flask application configured for testing
        WHEN GET '/api/v2/submissions' page is requested with the "offset" url parameter specified
        THEN check that the response is valid
        """
        target_limit = 2
        response = test_client.get(f"/api/v2/submissions?offset=1&limit={target_limit}")
        assert response.status_code == HTTPStatus.OK
        assert response.headers["Content-Type"] == "application/json"
        assert all(k in response.json for k in ("pagination", "submissions"))
        assert isinstance(response.json["pagination"], dict)
        assert isinstance(response.json["submissions"], list)
        assert len(response.json["submissions"]) == target_limit


class TestPostSubmission:
    """Tests for POST /api/v2/submissions"""

    @pytest.mark.uses_db
    def test_post_submissions_without_user(
        self, flask_app, test_client, dummy_submission, clean_db
    ):
        """
        GIVEN a Flask application configured for testing
        WHEN a new submission is posted without a user being logged in
        THEN the correct response is received and the submission is entered into the database
        """
        with flask_app.app_context():
            response = test_client.post("/api/v2/submissions", json=dummy_submission)
            current_datetime = datetime.now(timezone.utc)
            # submission_id property from post-submit response used here for testing but is also used by frontend to display post-submission link to dashboard
            new_submission = Submission.query.filter_by(
                id=response.json["submission_id"]
            ).first()

        assert response.status_code == HTTPStatus.CREATED
        assert response.json["status"] == "created"
        assert new_submission.latitude == dummy_submission["latitude"]
        assert new_submission.longitude == dummy_submission["longitude"]
        assert new_submission.issues == [IssueType.FULL]
        assert new_submission.parking_duration == ParkingDuration(
            dummy_submission["parking_duration"]
        )
        assert new_submission.parking_time == datetime.strptime(
            dummy_submission["parking_time"], "%Y-%m-%d %H:%M:%S.%f"
        )
        assert new_submission.comments == dummy_submission["comments"]
        assert (
            current_datetime - new_submission.submitted_datetime
        ).total_seconds() < 1
        assert new_submission.user_id is None

    @pytest.mark.uses_db
    def test_post_submissions_with_user(
        self,
        flask_app,
        test_client,
        token_auth_headers_admin,
        dummy_submission,
        clean_db,
    ):
        """
        GIVEN a Flask application configured for testing
        WHEN a new submission is posted with a user being logged in
        THEN the correct response is received and the submission is entered into the database
        """
        with flask_app.app_context():
            response = test_client.post(
                "/api/v2/submissions",
                json=dummy_submission,
                headers=token_auth_headers_admin,
            )
            current_datetime = datetime.now(timezone.utc)
            # submission_id property from post-submit response used here for testing but is also used by frontend to display post-submission link to dashboard
            new_submission = Submission.query.filter_by(
                id=response.json["submission_id"]
            ).first()

        assert response.status_code == HTTPStatus.CREATED
        assert response.json["status"] == "created"
        assert new_submission.latitude == dummy_submission["latitude"]
        assert new_submission.longitude == dummy_submission["longitude"]
        assert new_submission.issues == [IssueType.FULL]
        assert new_submission.parking_duration == ParkingDuration(
            dummy_submission["parking_duration"]
        )
        assert new_submission.parking_time == datetime.strptime(
            dummy_submission["parking_time"], "%Y-%m-%d %H:%M:%S.%f"
        )
        assert new_submission.comments == dummy_submission["comments"]
        assert (
            current_datetime - new_submission.submitted_datetime
        ).total_seconds() < 1
        assert isinstance(new_submission.user_id, int)

    @pytest.mark.uses_db
    def test_post_submissions_integrity_error(
        self, flask_app, test_client, dummy_submission, clean_db
    ):
        """
        GIVEN a Flask application configured for testing
        WHEN a POST to '/api/v2/submissions' triggers a database IntegrityError
        THEN check that the response returns a 500 error status
        """
        with flask_app.app_context():
            with patch(
                "bikespace_api.submissions.submissions_routes.db.session.commit",
                side_effect=SaIntegrityError(None, None, Exception()),
            ):
                response = test_client.post(
                    "/api/v2/submissions", json=dummy_submission
                )

        assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
        assert json.loads(response.get_data())["status"] == "error"


class TestGetSubmissionsWithID:
    """Tests for GET /api/v2/submissions/{submission_id}"""

    @pytest.mark.parametrize("target_id", [1, 4])
    def test_get_submissions_with_id(self, test_client, target_id):
        response = test_client.get(f"/api/v2/submissions/{target_id}")
        assert response.status_code == HTTPStatus.OK
        assert response.headers["Content-Type"] == "application/json"
        assert all(
            k in response.json
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
        assert response.json["id"] == target_id
        assert isinstance(response.json["latitude"], float)
        assert isinstance(response.json["longitude"], float)
        assert isinstance(response.json["issues"], list)
        assert isinstance(response.json["parking_duration"], str)
        assert isinstance(response.json["parking_time"], str)
        assert isinstance(response.json["comments"], str)
        assert isinstance(response.json["submitted_datetime"], (type(None), str))

    def test_get_nonexistent_submission_with_id(self, test_client, flask_app):
        """
        GIVEN a Flask application configured for testing
        GIVEN a submission ID that does not exist
        WHEN GET '/api/v2/submissions/{submission_id}' endpoint is requested
        THEN check that the response returns an error to show that the submission was not found
        """
        nonexistent_submission_id = 99999
        with flask_app.app_context():
            assert (
                Submission.query.filter_by(id=nonexistent_submission_id).first() is None
            )

        response = test_client.get(f"/api/v2/submissions/{nonexistent_submission_id}")
        assert response.status_code == HTTPStatus.NOT_FOUND


class TestPatchOrDeleteSubmission:
    """Tests for PATCH/DELETE /api/v2/submissions"""

    @pytest.mark.uses_db
    def test_patch_submission(
        self,
        flask_app,
        test_client,
        token_auth_headers_admin,
        dummy_submission,
        clean_db,
    ):
        """
        GIVEN a Flask application configured for testing
        WHEN a submission is patched (including the comment field)
        THEN the correct response is received and the submission is updated in the database
        """
        with flask_app.app_context():
            # create new submission
            response_create = test_client.post(
                "/api/v2/submissions",
                json=dummy_submission,
                headers=token_auth_headers_admin,
            )
            assert response_create.status_code == HTTPStatus.CREATED
            submission_id = response_create.json["submission_id"]

            # patch submission
            updated_issues = [IssueType.NOT_PROVIDED, IssueType.DAMAGED]
            updated_content = {  # pragma: no cover
                "comments": "updated comment",
                "issues": [str(issue.value) for issue in updated_issues],
            }
            response_update = test_client.patch(
                f"/api/v2/submissions/{submission_id}",
                json=updated_content,
                headers=token_auth_headers_admin,
            )
            assert response_update.status_code == HTTPStatus.OK
            assert response_update.json["status"] == "updated"
            assert response_update.json["submission_id"] == submission_id

            # get submission from database
            updated_submission = Submission.query.filter_by(id=submission_id).first()
            assert updated_submission.comments == updated_content["comments"]
            assert updated_submission.issues == updated_issues
            assert count_versions(updated_submission) == 2

    @pytest.mark.uses_db
    def test_patch_nonexistent_submission(
        self,
        flask_app,
        test_client,
        token_auth_headers_admin,
        clean_db,
    ):
        """
        GIVEN a Flask application configured for testing
        GIVEN a submission ID that does not exist
        WHEN PATCH '/api/v2/submissions/{submission_id}' endpoint is requested
        THEN check that the response returns an error to show that the submission was not found
        """
        nonexistent_submission_id = 99999
        with flask_app.app_context():
            assert (
                Submission.query.filter_by(id=nonexistent_submission_id).first() is None
            )

        updated_content = {"comments": "This submission does not exist!"}
        response = test_client.patch(
            f"/api/v2/submissions/{nonexistent_submission_id}",
            json=updated_content,
            headers=token_auth_headers_admin,
        )
        assert response.status_code == HTTPStatus.NOT_FOUND

    @pytest.mark.uses_db
    def test_patch_submission_integrity_error(
        self,
        flask_app,
        test_client,
        dummy_submission,
        token_auth_headers_admin,
        clean_db,
    ):
        """
        GIVEN a Flask application configured for testing
        WHEN PATCH '/api/v2/submissions/{submission_id}' triggers a database IntegrityError
        THEN check that the response returns a 500 error status
        """
        with flask_app.app_context():
            # create new submission
            response_create = test_client.post(
                "/api/v2/submissions",
                json=dummy_submission,
                headers=token_auth_headers_admin,
            )
            assert response_create.status_code == HTTPStatus.CREATED
            submission_id = response_create.json["submission_id"]

            # call PATCH endpoint with integrity error
            with patch(
                "bikespace_api.submissions.submissions_routes.db.session.commit",
                side_effect=SaIntegrityError(None, None, Exception()),
            ):
                updated_content = {"comments": "This submission does not exist!"}
                response_patch = test_client.patch(
                    f"/api/v2/submissions/{submission_id}",
                    json=updated_content,
                    headers=token_auth_headers_admin,
                )

            assert response_patch.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
            assert response_patch.json["status"] == "error"

    @pytest.mark.uses_db
    def test_delete_submission(
        self,
        flask_app,
        test_client,
        token_auth_headers_admin,
        dummy_submission,
        clean_db,
    ):
        """
        GIVEN a Flask application configured for testing
        WHEN a submission is deleted
        THEN the correct response is received, the submission is deleted in the database, but remains in the version history
        """
        with flask_app.app_context():
            # create new submission
            response_create = test_client.post(
                "/api/v2/submissions",
                json=dummy_submission,
                headers=token_auth_headers_admin,
            )
            assert response_create.status_code == HTTPStatus.CREATED
            submission_id = response_create.json["submission_id"]

            # delete submission
            response_delete = test_client.delete(
                f"/api/v2/submissions/{submission_id}",
                headers=token_auth_headers_admin,
            )
            assert response_delete.status_code == HTTPStatus.OK
            assert response_delete.json["status"] == "deleted"
            assert response_delete.json["submission_id"] == submission_id

            # check submission is deleted
            updated_submission = Submission.query.filter_by(id=submission_id).first()
            assert updated_submission is None

            # check submission still returns version history
            response_history = test_client.get(
                f"/api/v2/submissions/{submission_id}/history"
            )
            assert response_history.status_code == HTTPStatus.OK
            assert len(response_history.json[0]) > 1

    @pytest.mark.uses_db
    def test_delete_nonexistent_submission(
        self,
        flask_app,
        test_client,
        token_auth_headers_admin,
        clean_db,
    ):
        """
        GIVEN a Flask application configured for testing
        GIVEN a submission ID that does not exist
        WHEN DELETE '/api/v2/submissions/{submission_id}' endpoint is requested
        THEN check that the response returns an error to show that the submission was not found
        """
        nonexistent_submission_id = 99999
        with flask_app.app_context():
            assert (
                Submission.query.filter_by(id=nonexistent_submission_id).first() is None
            )

        response = test_client.delete(
            f"/api/v2/submissions/{nonexistent_submission_id}",
            headers=token_auth_headers_admin,
        )
        assert response.status_code == HTTPStatus.NOT_FOUND

    @pytest.mark.uses_db
    def test_delete_submission_integrity_error(
        self,
        flask_app,
        test_client,
        dummy_submission,
        token_auth_headers_admin,
        clean_db,
    ):
        """
        GIVEN a Flask application configured for testing
        WHEN DELETE '/api/v2/submissions/{submission_id}' triggers a database IntegrityError
        THEN check that the response returns a 500 error status
        """
        with flask_app.app_context():
            # create new submission
            response_create = test_client.post(
                "/api/v2/submissions",
                json=dummy_submission,
                headers=token_auth_headers_admin,
            )
            assert response_create.status_code == HTTPStatus.CREATED
            submission_id = response_create.json["submission_id"]

            # call DELETE endpoint with integrity error
            with patch(
                "bikespace_api.submissions.submissions_routes.db.session.commit",
                side_effect=SaIntegrityError(None, None, Exception()),
            ):
                response_patch = test_client.delete(
                    f"/api/v2/submissions/{submission_id}",
                    headers=token_auth_headers_admin,
                )

            assert response_patch.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
            assert response_patch.json["status"] == "error"


class TestGetSubmissionHistory:
    """Tests for GET /api/v2/submissions/{submission_id}/history"""

    @pytest.mark.uses_db
    def test_get_submission_history(self, flask_app, test_client, clean_db):
        """
        GIVEN a Flask application and a Submission entry configured for testing
        GIVEN database actions for that Submission to create, update, and delete
        WHEN GET '/api/v2/submissions/{submission_id}/history' data is requested
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
            test_submission = Submission.query.filter_by(
                comments=initial_comment
            ).first()
            submission_id = test_submission.id

            # request the edit history - should show one create action
            response_create = test_client.get(
                f"/api/v2/submissions/{submission_id}/history"
            )
            result_create = json.loads(response_create.get_data())
            assert response_create.status_code == HTTPStatus.OK
            assert response_create.headers["Content-Type"] == "application/json"
            assert len(result_create) == 1
            assert all(
                k in result_create[0] for k in ("operation_description", "changes")
            )
            assert (
                result_create[0]["operation_description"] == OperationType.CREATE.name
            )
            assert len(result_create[0]["changes"]) > 0

            # modify a property - should show an additional update action
            test_submission.comments = "history test - update"
            db.session.commit()

            response_update = test_client.get(
                f"/api/v2/submissions/{submission_id}/history"
            )
            result_update = json.loads(response_update.get_data())
            assert response_update.status_code == HTTPStatus.OK
            assert response_update.headers["Content-Type"] == "application/json"
            assert len(result_update) == 2
            assert all(
                k in result_update[1] for k in ("operation_description", "changes")
            )
            assert (
                result_update[1]["operation_description"] == OperationType.UPDATE.name
            )
            assert len(result_update[1]["changes"]) == 1  # update to comment only

            # delete the submission - should show an additional delete action
            # confirms that the view queries on the history table, since the submission table will not return a result for a deleted entry
            db.session.delete(test_submission)
            db.session.commit()

            response_delete = test_client.get(
                f"/api/v2/submissions/{submission_id}/history"
            )
            result_delete = json.loads(response_delete.get_data())

            assert response_delete.status_code == HTTPStatus.OK
            assert response_delete.headers["Content-Type"] == "application/json"
            assert len(result_delete) == 3
            assert all(
                k in result_delete[2] for k in ("operation_description", "changes")
            )
            assert (
                result_delete[2]["operation_description"] == OperationType.DELETE.name
            )
            assert (
                len(result_delete[2]["changes"]) == 0
            )  # no changes for delete action since it applies record-wide


class TestRollback:
    """Tests rollback functionality. Not currently implemented in routes."""

    @pytest.mark.uses_db
    def test_rollback_change(self, flask_app, test_client, clean_db):
        """
        GIVEN a Flask application and a Submission entry configured for testing
        GIVEN a history of more than one change to the Submission, including a create, update, and delete
        WHEN a series of non-sequential reverts is requested for all three operation types using sqlalchemy_continuum
        THEN check that the Submission and its version history table are properly updated
        """
        with flask_app.app_context():
            # create a new submission for testing
            initial_comment = "rollback test - create"
            db.session.add(
                Submission(
                    43.1234,
                    -79.1234,
                    [IssueType.OTHER],
                    ParkingDuration.MINUTES,
                    datetime.now(),
                    initial_comment,
                )
            )
            db.session.commit()
            test_submission = Submission.query.filter_by(
                comments=initial_comment
            ).first()
            submission_id = test_submission.id

            # set up class and query to get versions
            # you can also query on Submission.versions but querying on SubmissionVersion is more robust since it still works if the Submission has been deleted
            SubmissionVersion = version_class(Submission)
            versions_query = SubmissionVersion.query.filter_by(
                id=submission_id
            ).order_by(SubmissionVersion.transaction_id)
            submission_query = Submission.query.filter_by(id=submission_id)

            # modify a property
            update_comment = "rollback test - update"
            test_submission.comments = update_comment
            db.session.commit()

            # delete the submission
            db.session.delete(test_submission)
            db.session.commit()

            # at this point there should be three versions: create, update, and delete
            assert versions_query.count() == 3

            # revert from delete (v3) to create (v1) - adds an additional version
            versions_query.first().revert()
            db.session.commit()

            assert submission_query.first().comments == initial_comment
            assert versions_query.count() == 4

            # v5: revert from v4 to update (v2)
            versions_query.all()[1].revert()
            db.session.commit()

            assert submission_query.first().comments == update_comment
            assert versions_query.count() == 5

            # v6: revert to delete (v3)
            versions_query.all()[2].revert()
            db.session.commit()

            assert submission_query.first() is None
            assert versions_query.count() == 6
