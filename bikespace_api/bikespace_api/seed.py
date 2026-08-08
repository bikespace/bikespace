"""Shared seed data used by both manage.py (seed_dev_db) and the pytest session fixture.

Keep this as the single source of truth for canonical test/dev submissions and users.
"""

from datetime import datetime

from flask_security.utils import hash_password

from bikespace_api import create_userdatastore, db
from bikespace_api.admin.admin_models import Role, User
from bikespace_api.admin.roles import ApplicationRoles
from bikespace_api.submissions.submissions_models import (
    IssueType,
    ParkingDuration,
    Submission,
)

admin_user = {
    "username": "adminuser",
    "first_name": "Admin",
    "last_name": "User",
    "email": "admin@example.com",
    "password": "admin",
    "roles": [ApplicationRoles.USER, ApplicationRoles.SUPERUSER],
}
non_admin_user = {
    "username": "nonadminuser",
    "first_name": "Not an Admin",
    "last_name": "User",
    "email": "notanadmin@example.com",
    "password": "notanadmin",
    "roles": [ApplicationRoles.USER],
}


def seed_base_data():
    """Seed the 4 canonical submissions and 2 test users. Requires an active app context."""
    user_datastore = create_userdatastore(db, User, Role)

    # create user roles
    user_role = Role(name=ApplicationRoles.USER)
    super_user_role = Role(name=ApplicationRoles.SUPERUSER)
    for role in [user_role, super_user_role]:
        if db.session.query(Role).filter_by(name=role.name).first() is None:
            db.session.add(role)
            db.session.commit()

    # create users
    user_datastore.create_user(
        username=admin_user["username"],
        first_name=admin_user["first_name"],
        last_name=admin_user["last_name"],
        email=admin_user["email"],
        password=hash_password(admin_user["password"]),
        roles=[
            Role(name=role_name) for role_name in admin_user["roles"]
        ],  # pragma: no cover
    )
    db.session.commit()

    user_datastore.create_user(
        username=non_admin_user["username"],
        first_name=non_admin_user["first_name"],
        last_name=non_admin_user["last_name"],
        email=non_admin_user["email"],
        password=hash_password(non_admin_user["password"]),
        roles=[
            Role(name=role_name) for role_name in non_admin_user["roles"]
        ],  # pragma: no cover
    )
    db.session.commit()

    # create submissions
    db.session.add(
        Submission(
            43.6532,
            -79.3832,
            [IssueType.ABANDONDED],
            ParkingDuration.MINUTES,
            datetime.now(),
            "comments1",
            User.query.filter_by(username=non_admin_user["username"]).first().id,
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
            User.query.filter_by(username=admin_user["username"]).first().id,
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
