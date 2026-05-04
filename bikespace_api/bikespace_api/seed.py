"""Shared seed data used by both manage.py (seed_dev_db) and the pytest session fixture.

Keep this as the single source of truth for canonical test/dev submissions and users.
"""

from datetime import datetime

from flask_security.utils import hash_password

from bikespace_api import create_userdatastore, db
from bikespace_api.admin.admin_models import Role, User
from bikespace_api.submissions.submissions_models import IssueType, ParkingDuration, Submission


def seed_base_data():
    """Seed the 4 canonical submissions and 2 test users. Requires an active app context."""
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
