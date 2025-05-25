import os
import time

from flask.cli import FlaskGroup
from sqlalchemy_utils import database_exists, create_database, drop_database

from bikespace_api import create_app, db, create_userdatastore 
from bikespace_api.api.models import Submission, IssueType, ParkingDuration, User, Role
from datetime import datetime
from flask_security.utils import hash_password    
import random
import string

app = create_app()
cli = FlaskGroup(create_app=create_app)
user_datastore = create_userdatastore(db, User, Role)


@cli.command()
def test_db_server():
    duration = 0
    while duration < 10:
        stream = os.popen(r"pg_isready -h localhost -p 5432")
        stream.read()
        if stream.close() is None:
            return
        time.sleep(1)
        duration += 1

    raise Exception("Unable to connect to a Postgres server")


@cli.command()
def recreate_db():
    if database_exists(app.config["SQLALCHEMY_DATABASE_URI"]):
        drop_database(app.config["SQLALCHEMY_DATABASE_URI"])
    create_database(app.config["SQLALCHEMY_DATABASE_URI"])


@cli.command()
def seed_db():
    """Seeds the database"""
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
    user_role = Role(name="user")
    super_user_role = Role(name="superuser")
    db.session.add(user_role)
    db.session.add(super_user_role)
    db.session.commit()

    user_datastore.create_user(
        first_name="Admin",
        email="admin@example.com",
        password=hash_password("admin"),
        roles=[user_role, super_user_role],
    )

    # have to manually null out submitted_datetime to replicate grandfathered database entry
    submitted_datetime_null = db.session.execute(
        db.select(Submission).filter_by(comments="Example of null submitted_datetime")
    ).scalar_one()
    submitted_datetime_null.submitted_datetime = None
    db.session.commit()

    first_names = [
            "Harry",
            "Amelia",
            "Oliver",
            "Jack",
    ]
    last_names = [
            "Brown",
            "Smith",
            "Patel",
            "Jones",
    ]

    for i in range(len(first_names)):
        tmp_email = (
            first_names[i].lower() + "." + last_names[i].lower() + "@example.com"
        )
        tmp_pass = "".join(
            random.choice(string.ascii_lowercase + string.digits) for i in range(10)
        )
        user_datastore.create_user(
            first_name=first_names[i],
            last_name=last_names[i],
            email=tmp_email,
            password=hash_password(tmp_pass),
            roles=[
                user_role,
            ],
        )
    db.session.commit()


if __name__ == "__main__":
    cli()
