from http import HTTPStatus

from bikespace_api import db
from bikespace_api.statuses.statuses_models import BikeParkingStatus, StatusName


VISIBLE_STATUS = {
    "status_type": StatusName.ACTION_REQUIRED,
    "status_type_label": "Action Required",
    "status_name": "test_visible",
    "status_description": "Test visible status",
    "hide_by_default": False,
}

HIDDEN_STATUS = {
    "status_type": StatusName.CLOSED_UNRESOLVED,
    "status_type_label": "Closed",
    "status_name": "test_hidden",
    "status_description": "Test hidden status",
    "hide_by_default": True,
}


class TestGetBikeParkingStatuses:
    """Tests for GET /api/v2/bikeparking-statuses"""

    def test_get_statuses_returns_200(self, test_client):
        """
        GIVEN a Flask application configured for testing
        WHEN GET '/api/v2/bikeparking-statuses' is requested
        THEN check that the response is 200 with a JSON list
        """
        response = test_client.get("/api/v2/bikeparking-statuses")
        assert response.status_code == HTTPStatus.OK
        assert response.headers["Content-Type"] == "application/json"
        assert isinstance(response.json, list)

    def test_get_statuses_returns_all_including_hidden(self, flask_app, test_client, clean_db):
        """
        GIVEN a Flask application with one visible and one hidden status
        WHEN GET '/api/v2/bikeparking-statuses' is requested
        THEN both visible and hidden statuses are returned
        """
        with flask_app.app_context():
            db.session.add(BikeParkingStatus(**VISIBLE_STATUS))
            db.session.add(BikeParkingStatus(**HIDDEN_STATUS))
            db.session.commit()

        response = test_client.get("/api/v2/bikeparking-statuses")
        assert response.status_code == HTTPStatus.OK
        returned_names = [s["status_name"] for s in response.json]
        assert VISIBLE_STATUS["status_name"] in returned_names
        assert HIDDEN_STATUS["status_name"] in returned_names

    def test_get_statuses_response_shape(self, flask_app, test_client, clean_db):
        """
        GIVEN a Flask application with a seeded status
        WHEN GET '/api/v2/bikeparking-statuses' is requested
        THEN each item has the expected fields with correct types
        """
        with flask_app.app_context():
            db.session.add(BikeParkingStatus(**VISIBLE_STATUS))
            db.session.commit()

        response = test_client.get("/api/v2/bikeparking-statuses")
        assert response.status_code == HTTPStatus.OK
        assert len(response.json) > 0

        item = response.json[0]
        assert all(
            k in item
            for k in ("id", "status_type", "status_type_label", "status_name", "status_description", "hide_by_default", "created_at", "updated_at")
        )
        assert isinstance(item["id"], int)
        assert isinstance(item["status_type"], str)
        assert isinstance(item["status_type_label"], str)
        assert isinstance(item["status_name"], str)
        assert isinstance(item["status_description"], str)
        assert isinstance(item["hide_by_default"], bool)

    def test_get_statuses_empty_db(self, flask_app, test_client, clean_db):
        """
        GIVEN a Flask application with no statuses in the database
        WHEN GET '/api/v2/bikeparking-statuses' is requested
        THEN an empty list is returned
        """
        with flask_app.app_context():
            db.session.execute(
                db.delete(BikeParkingStatus)
            )
            db.session.commit()

        response = test_client.get("/api/v2/bikeparking-statuses")
        assert response.status_code == HTTPStatus.OK
        assert response.json == []

    def test_get_statuses_seed_data_loaded(self, flask_app, test_client, clean_db):
        """
        GIVEN a Flask application with seed data loaded
        WHEN GET '/api/v2/bikeparking-statuses' is requested
        THEN all 14 seeded statuses are present
        """
        response = test_client.get("/api/v2/bikeparking-statuses")
        assert response.status_code == HTTPStatus.OK
        assert len(response.json) == 14

    def test_get_statuses_versioning(self, flask_app, test_client, clean_db):
        """
        GIVEN a BikeParkingStatus that is created then updated
        WHEN the status is modified
        THEN the change is tracked in the version history table via sqlalchemy_continuum
        """
        from sqlalchemy_continuum import version_class

        with flask_app.app_context():
            status = BikeParkingStatus(**VISIBLE_STATUS)
            db.session.add(status)
            db.session.commit()
            status_id = status.id

            status.status_description = "Updated description"
            db.session.commit()

            BikeParkingStatusVersion = version_class(BikeParkingStatus)
            versions = (
                BikeParkingStatusVersion.query.filter_by(id=status_id)
                .order_by(BikeParkingStatusVersion.transaction_id)
                .all()
            )

        assert len(versions) == 2
        assert versions[0].status_description == VISIBLE_STATUS["status_description"]
        assert versions[1].status_description == "Updated description"
