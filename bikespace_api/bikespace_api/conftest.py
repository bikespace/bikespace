from datetime import datetime, timezone

import pytest
from flask_security.utils import hash_password
from sqlalchemy import text

from bikespace_api import create_app, create_userdatastore, db
from bikespace_api.admin.admin_models import Role, User
from bikespace_api.submissions.submissions_models import (
    IssueType,
    ParkingDuration,
    Submission,
)


def _seed_base_data():
    """Seed minimal test data. Must be called within an active app context."""
    user_datastore = create_userdatastore(db, User, Role)

    db.session.add(
        Submission(
            43.6532,
            -79.3832,
            [IssueType.ABANDONDED],
            ParkingDuration.MINUTES,
            datetime.now(),
            "comments1",
        )
    )
    db.session.add(
        Submission(
            43.6532,
            -79.3832,
            [IssueType.NOT_PROVIDED, IssueType.DAMAGED],
            ParkingDuration.HOURS,
            datetime.now(),
            "comments2",
        )
    )
    db.session.add(
        Submission(
            43.6532,
            -79.3832,
            [IssueType.NOT_PROVIDED, IssueType.FULL, IssueType.ABANDONDED],
            ParkingDuration.MULTIDAY,
            datetime.now(),
            "comments2",
        )
    )
    db.session.add(
        Submission(
            43.65,
            -79.40,
            [IssueType.OTHER],
            ParkingDuration.MINUTES,
            datetime.now(),
            "Example of null submitted_datetime",
        )
    )
    db.session.commit()

    # Replicate a grandfathered DB entry with no submitted_datetime
    null_submission = db.session.execute(
        db.select(Submission).filter_by(comments="Example of null submitted_datetime")
    ).scalar_one()
    null_submission.submitted_datetime = None
    db.session.commit()

    user_role = Role(name="user")
    super_user_role = Role(name="superuser")
    for role in [user_role, super_user_role]:
        if db.session.query(Role).filter_by(name=role.name).first() is None:
            db.session.add(role)
            db.session.commit()

    user_datastore.create_user(
        first_name="Admin",
        last_name="User",
        email="admin@example.com",
        password=hash_password("admin"),
        roles=[user_role, super_user_role],
    )
    db.session.commit()

    user_datastore.create_user(
        first_name="Not an Admin",
        last_name="User",
        email="notanadmin@example.com",
        password=hash_password("notanadmin"),
        roles=[user_role],
    )
    db.session.commit()


@pytest.fixture(scope="session", autouse=True)
def _setup_database():
    """Drop, recreate, and seed the test database once per session.

    Replaces the manual recreate-db + db upgrade steps, making the test suite
    self-contained.
    """
    app = create_app()
    app.config.from_object("bikespace_api.config.TestingConfig")
    with app.app_context():
        db.drop_all()
        db.create_all()
        _seed_base_data()


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
        _seed_base_data()
    yield


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
    role = Role(id=1, name="user", description="Base user role")
    return role


@pytest.fixture()
def new_base_user():
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
