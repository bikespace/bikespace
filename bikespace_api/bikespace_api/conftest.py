from datetime import datetime, timezone

import pytest
from sqlalchemy import text

from sqlalchemy_utils import create_database, database_exists, drop_database

from bikespace_api import create_app, db
from bikespace_api.admin.admin_models import Role, User
from bikespace_api.seed import seed_base_data
from bikespace_api.submissions.submissions_models import (
    IssueType,
    ParkingDuration,
    Submission,
)


@pytest.fixture(scope="session", autouse=True)
def _setup_database():
    """Drop, recreate, and seed the test database once per session.

    Replaces the manual recreate-db + db upgrade steps, making the test suite
    self-contained.
    """
    app = create_app()
    app.config.from_object("bikespace_api.config.TestingConfig")
    with app.app_context():
        db_uri = app.config["SQLALCHEMY_DATABASE_URI"]
        if database_exists(db_uri):  # pragma: no branch
            drop_database(db_uri)
        create_database(db_uri)
        db.create_all()
        seed_base_data()


@pytest.fixture()
def flask_app():
    """Pytest fixture to create an instance of the app for testing."""
    flask_app = create_app()
    flask_app.config.from_object("bikespace_api.config.TestingConfig")
    yield flask_app


@pytest.fixture()
def test_client(flask_app):
    return flask_app.test_client()


@pytest.fixture()
def clean_db(flask_app):
    """Truncate all tables, reset sequences, and re-seed before each DB-writing test."""
    with flask_app.app_context():
        meta = db.metadata
        table_names = ", ".join(f'"{t.name}"' for t in meta.sorted_tables)
        db.session.execute(
            text(f"TRUNCATE TABLE {table_names} RESTART IDENTITY CASCADE")
        )
        db.session.commit()
        seed_base_data()
    yield


@pytest.fixture()
def new_submission_without_user():
    datetime_string = "2023-08-19 15:17:17.234235"
    datetime_object = datetime.strptime(datetime_string, "%Y-%m-%d %H:%M:%S.%f")
    submission = Submission(
        latitude=43.6532,
        longitude=-79.3832,
        issues=[IssueType.ABANDONDED],
        parking_duration=ParkingDuration.MINUTES,
        parking_time=datetime_object,
        comments="comments",
    )
    return submission


@pytest.fixture()
def new_base_user_role():
    role = Role(id=1, name="user", description="Base user role")
    return role


@pytest.fixture()
def new_base_user():
    user = User(
        id=1,
        username="test_user",
        first_name="Test",
        last_name="User",
        email="test.user@example.com",
        password="password",
        active=True,
        confirmed_at=datetime.now(),
        fs_uniquifier="unique12345",
    )
    return user


@pytest.fixture()
def new_submission_with_user(new_base_user):
    datetime_string = "2026-01-02 15:17:17.234235"
    datetime_object = datetime.strptime(datetime_string, "%Y-%m-%d %H:%M:%S.%f")
    submission = Submission(
        latitude=43.7532,
        longitude=-79.4832,
        issues=[IssueType.ABANDONDED],
        parking_duration=ParkingDuration.MINUTES,
        parking_time=datetime_object,
        comments="comments submission with user",
        user_id=new_base_user.id,
    )
    return submission


@pytest.fixture()
def logged_in_admin_client(test_client, clean_db):
    test_client.post(
        "/admin/login/",
        data=dict(email="admin@example.com", password="admin"),
        follow_redirects=True,
    )
    return test_client


@pytest.fixture()
def token_auth_headers_admin(test_client, clean_db):
    auth_response = test_client.post(
        "/admin/login/",
        json=dict(email="admin@example.com", password="admin"),
        query_string=dict(include_auth_token=""),
        follow_redirects=False,
    )
    response_data = auth_response.json
    csrf_token = response_data["response"]["csrf_token"]
    authentication_token = response_data["response"]["user"]["authentication_token"]

    return {
        "X-CSRF-Token": csrf_token,
        "Authentication-Token": authentication_token,
    }
