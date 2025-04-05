import os
import time

from flask.cli import FlaskGroup
from flask_security import hash_password
from sqlalchemy_utils import database_exists, create_database

from bikespace_api import create_app, db, security
from bikespace_api.api.models import Submission, IssueType, ParkingDuration
from datetime import datetime

app = create_app()
cli = FlaskGroup(create_app=create_app)


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
    if not database_exists(app.config["SQLALCHEMY_DATABASE_URI"]):
        create_database(app.config["SQLALCHEMY_DATABASE_URI"])

    db.drop_all()
    db.create_all()
    if not security.datastore.find_user(email="test@me.com"):
        security.datastore.create_user(email="test@me.com", password=hash_password("password"))
    db.session.commit()


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
    db.session.commit()

    # have to manually null out submitted_datetime to replicate grandfathered database entry
    submitted_datetime_null = db.session.execute(
        db.select(Submission).filter_by(comments="Example of null submitted_datetime")
    ).scalar_one()
    submitted_datetime_null.submitted_datetime = None
    db.session.commit()


if __name__ == "__main__":
    cli()
