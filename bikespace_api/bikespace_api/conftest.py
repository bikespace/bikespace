from datetime import datetime

import pytest
from bikespace_api.submissions.submissions_models import (
    IssueType,
    ParkingDuration,
    Submission,
)

from bikespace_api import create_app


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
def new_submission():
    datetime_string = "2023-08-19 15:17:17.234235"
    datetime_object = datetime.strptime(datetime_string, "%Y-%m-%d %H:%M:%S.%f")
    submission = Submission(
        43.6532,
        -79.3832,
        [IssueType.ABANDONDED],
        ParkingDuration.MINUTES,
        datetime_object,
        "comments",
    )
    return submission


@pytest.fixture()
def new_base_user_role():
    from bikespace_api.admin.admin_models import Role

    role = Role(id=1, name="user", description="Base user role")
    return role


@pytest.fixture()
def new_base_user():
    from bikespace_api.admin.admin_models import User

    user = User(
        id=1,
        first_name="Test",
        last_name="User",
        email="test.user@example.com",
        password="password",
        active=True,
        confirmed_at=datetime.now(),
        fs_uniquifier="unique12345",
    )
    return user
