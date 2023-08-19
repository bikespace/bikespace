from bikespace_api import create_app
from bikespace_api.api.models import Submission, IssueType, ParkingDuration
from datetime import datetime
import os
import pytest

@pytest.fixture(scope='module')
def new_submission():
    datetime_string = "2023-08-19 15:17:17.234235"
    datetime_object = datetime.strptime(datetime_string, '%Y-%m-%d %H:%M:%S.%f')
    submission = Submission(43.6532, -79.3832, [IssueType.ABANDONDED], ParkingDuration.MINUTES, datetime_object, "comments")
    return submission

@pytest.fixture(scope='module')
def test_client():
    # Set the Testing configuration prior to creating the Flask application
    os.environ['APP_SETTINGS'] = 'bikespace_api.config.TestingConfig'
    flask_app = create_app()

    with flask_app.test_client() as testing_client:
        with flask_app.app_context():
            yield testing_client