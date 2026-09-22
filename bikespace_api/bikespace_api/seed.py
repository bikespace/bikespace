"""Shared seed data used by both manage.py (seed_dev_db) and the pytest session fixture.

Keep this as the source of truth for canonical test/dev submissions and users. Make sure to keep the following files synced to changes in this file:

- bikespace_frontend/e2etests/constants.ts
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
from bikespace_api.statuses.statuses_models import BikeParkingStatus, StatusName

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


BIKEPARKING_STATUSES = [
    ("new_report", StatusName.ACTION_REQUIRED, "Issue has been reported but no action taken yet", False),
    ("needs_survey", StatusName.ACTION_REQUIRED, "Nature of issue is unclear from report details; area should be surveyed in-person", False),
    ("reported_to_city", StatusName.RESOLUTION_PENDING, "Issue has been reported to the City of Toronto", False),
    ("reported_to_operator", StatusName.RESOLUTION_PENDING, "Issue has been reported to the organization or person responsible for maintaining the bicycle parking", False),
    ("resolution_pending", StatusName.RESOLUTION_PENDING, "Operator/city has initiated but not completed the process to resolve the issue", False),
    ("resolved", StatusName.RESOLVED_SUCCESS, "Issue reported by the user was fully resolved with some action taken", False),
    ("partially_resolved", StatusName.RESOLVED_SUCCESS, "Issue was partially resolved; original issue closed, new issue opened for permanent fix", False),
    ("noted_for_information", StatusName.RESOLVED_INFORMATIONAL, "Issue does not require specific action; helps indicate a broader pattern", False),
    ("archived", StatusName.CLOSED_UNRESOLVED, "Issue closed; no recent action taken", True),
    ("unable_to_resolve", StatusName.CLOSED_UNRESOLVED, "Action taken but did not resolve the issue; no additional actions planned", False),
    ("app_feedback", StatusName.RESOLVED_INFORMATIONAL, "About the app, not about bike parking", False),
    ("data_caution", StatusName.ACTION_REQUIRED, "Unclear whether this is a valid issue report; extra scrutiny applied", False),
    ("data_invalid", StatusName.INVALID_SUBMISSION, "Not a valid issue report, e.g. a duplicate or test entry", True),
    ("duplicate_report", StatusName.INVALID_SUBMISSION, "Same submission as a previously submitted report", True),
]


def seed_base_data():
    """Seed the 4 canonical submissions, 2 test users, and 14 bike parking statuses. Requires an active app context."""
    user_datastore = create_userdatastore(db, User, Role)

    # seed bikeparking statuses
    for status_type, status_name, status_description, hide_by_default in BIKEPARKING_STATUSES:
        if db.session.query(BikeParkingStatus).filter_by(status_type=status_type).first() is None:
            db.session.add(
                BikeParkingStatus(
                    status_type=status_type,
                    status_name=status_name,
                    status_description=status_description,
                    hide_by_default=hide_by_default,
                )
            )
    db.session.commit()

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
