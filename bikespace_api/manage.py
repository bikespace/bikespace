import unittest
from flask.cli import FlaskGroup

from bikespace_api import create_app, db
from bikespace_api.api.models import Submission, IssueType, ParkingDuration
from datetime import datetime

import json

app = create_app()
cli = FlaskGroup(create_app=create_app)

@cli.command()
def recreate_db():
    db.drop_all()
    db.create_all()
    db.session.commit()


@cli.command()
def test():
    """Runs the tests without code coverage."""
    tests = unittest.TestLoader().discover(
        "bikespace_api/tests", pattern="test*.py"
    )
    result = unittest.TextTestRunner(verbosity=2).run(tests)
    if result.wasSuccessful():
        return 0
    return 1


@cli.command()
def seed_db():
    """Seeds the database"""
    db.session.add(
        Submission(43.6532, -79.3832, [IssueType.ABANDONDED], ParkingDuration.MINUTES, datetime.now(), "comments1")
    )
    db.session.add(
        Submission(43.6532, -79.3832, [IssueType.NOT_PROVIDED,IssueType.DAMAGED], ParkingDuration.HOURS, datetime.now(), "comments2")
    )
    db.session.add(
        Submission(43.6532, -79.3832, [IssueType.NOT_PROVIDED,IssueType.FULL,IssueType.ABANDONDED], ParkingDuration.MULTIDAY, datetime.now(), "comments2")
    )
    db.session.commit()


if __name__ == "__main__":
    cli()
