from bikespace_api.api.models import Submission, IssueType, ParkingDuration
from datetime import datetime


def test_new_submission(new_submission):
    """
    GIVEN a Submission model
    WHEN a new submission is created
    THEN check the latitude, longitude, issues, parking_duration parking_time and comments are defined correctly
    """
    datetime_string = "2023-08-19 15:17:17.234235"
    datetime_object = datetime.strptime(datetime_string, "%Y-%m-%d %H:%M:%S.%f")
    assert new_submission.latitude == 43.6532
    assert new_submission.longitude == -79.3832
    assert new_submission.issues == [IssueType.ABANDONDED]
    assert new_submission.parking_duration == ParkingDuration.MINUTES
    assert new_submission.parking_time == datetime_object
    assert new_submission.comments == "comments"
