from bikespace_api.submissions.submissions_models import (
    Submission,
    IssueType,
    ParkingDuration,
)
from datetime import datetime, timezone


def test_enum_string_methods():
    """
    GIVEN the IssueType or ParkingDuration enum
    WHEN __str__ is called
    The enum's name property is returned
    """
    assert str(IssueType.NOT_PROVIDED) == IssueType.NOT_PROVIDED.name
    assert str(ParkingDuration.MINUTES) == ParkingDuration.MINUTES.name


def test_new_submission(new_submission):
    """
    GIVEN a Submission model
    WHEN a new submission is created
    THEN check the latitude, longitude, issues, parking_duration parking_time and comments are defined correctly
    """
    datetime_string = "2023-08-19 15:17:17.234235"
    datetime_object = datetime.strptime(datetime_string, "%Y-%m-%d %H:%M:%S.%f")
    current_datetime = datetime.now(timezone.utc)
    assert new_submission.latitude == 43.6532
    assert new_submission.longitude == -79.3832
    assert new_submission.issues == [IssueType.ABANDONDED]
    assert new_submission.parking_duration == ParkingDuration.MINUTES
    assert new_submission.parking_time == datetime_object
    assert new_submission.comments == "comments"
    assert (current_datetime - new_submission.submitted_datetime).total_seconds() < 1
