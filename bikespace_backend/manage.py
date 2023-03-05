import unittest
from flask.cli import FlaskGroup

from bikespace_backend import create_app, db
from bikespace_backend.api.models import SurveyAnswer

import json

app = create_app()
cli = FlaskGroup(create_app=create_app)

sample_survey = {"key": "value"}


@cli.command()
def recreate_db():
    db.drop_all()
    db.create_all()
    db.session.commit()


@cli.command()
def test():
    """Runs the tests without code coverage."""
    tests = unittest.TestLoader().discover(
        "bikespace_backend/tests", pattern="test*.py"
    )
    result = unittest.TextTestRunner(verbosity=2).run(tests)
    if result.wasSuccessful():
        return 0
    return 1


@cli.command()
def seed_db():
    """Seeds the database"""
    db.session.add(
        SurveyAnswer(43.6532, -79.3832, json.dumps(sample_survey), "comments")
    )
    db.session.commit()


if __name__ == "__main__":
    cli()
