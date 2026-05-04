import os
import time
from datetime import datetime

from dotenv import load_dotenv
from faker import Faker
from flask.cli import FlaskGroup
from flask_security.utils import hash_password
import sqlalchemy as sa
from sqlalchemy_utils import create_database, database_exists, drop_database

from bikespace_api import create_app, create_userdatastore, db
from bikespace_api.submissions.submissions_models import (
    IssueType,
    ParkingDuration,
    Submission,
)
from bikespace_api.admin.admin_models import Role, User

LOAD_TESTING_NUMBER_OF_SUBMISSIONS = 1500

# used by the remaining make commands that do not use docker, e.g. test-api, test-api-terminal
load_dotenv()

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
def add_seed_user():
    """Add a seed admin user to the database if there are no admins"""
    # create superuser role if it does not yet exist
    super_user_role = Role(name="superuser")
    if db.session.query(Role).filter_by(name="superuser").first() is None:
        db.session.add(super_user_role)
        db.session.commit()

    # create seed user only if no superusers are in the db
    if db.session.query(User).join(Role, Role == super_user_role).first() is None:
        user_datastore.create_user(
            first_name="Seed",
            last_name="Admin",
            email=app.config["SEED_USER_EMAIL"],
            password=hash_password(app.config["SEED_USER_PASSWORD"]),
            roles=[super_user_role],
        )
        db.session.commit()


def _seed_base_data():
    """Adds the 4 canonical submissions and 2 test users shared by all environments."""
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

    # replicate a grandfathered database entry with no submitted_datetime
    submitted_datetime_null = db.session.execute(
        db.select(Submission).filter_by(comments="Example of null submitted_datetime")
    ).scalar_one()
    submitted_datetime_null.submitted_datetime = None
    db.session.commit()


@cli.command()
def seed_test_db():
    """Seeds the database with minimal fixture data for unit tests"""
    _seed_base_data()


@cli.command()
def seed_dev_db():
    """Seeds the database with full dev/load-testing data"""
    _seed_base_data()

    # add additional submissions to test at similar load levels to production
    # creates a cluster of 100 points
    fake = Faker(locale="en_CA")
    Faker.seed(12345)
    load_testing_submissions = [
        dict(
            latitude=43.662 if index < 100 else fake.latitude(),
            longitude=-79.391 if index < 100 else fake.longitude(),
            issues=[fake.enum(IssueType)],
            parking_duration=fake.enum(ParkingDuration),
            parking_time=fake.date_time_this_year(),
            comments=fake.text(max_nb_chars=250),
        )
        for index in range(LOAD_TESTING_NUMBER_OF_SUBMISSIONS)
    ]
    db.session.execute(
        sa.insert(Submission),
        load_testing_submissions,
    )
    db.session.commit()


if __name__ == "__main__":
    cli()
