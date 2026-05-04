import os
import time

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
from bikespace_api.seed import seed_base_data

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


@cli.command()
def seed_dev_db():
    """Seeds the database with full dev/load-testing data"""
    seed_base_data()

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
