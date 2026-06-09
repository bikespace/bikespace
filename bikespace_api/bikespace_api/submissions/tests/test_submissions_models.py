from bikespace_api.submissions.submissions_models import IssueType, ParkingDuration
from datetime import datetime, timezone


def test_enum_string_methods():
    """
    GIVEN the IssueType or ParkingDuration enum
    WHEN __str__ is called
    The enum's name property is returned
    """
    assert str(IssueType.NOT_PROVIDED) == IssueType.NOT_PROVIDED.name
    assert str(ParkingDuration.MINUTES) == ParkingDuration.MINUTES.name


def test_new_submission_without_user(new_submission_without_user):
    """
    GIVEN a Submission model without a user
    WHEN a new submission is created
    THEN check the properties are defined correctly
    """
    datetime_string = "2023-08-19 15:17:17.234235"
    datetime_object = datetime.strptime(datetime_string, "%Y-%m-%d %H:%M:%S.%f")
    current_datetime = datetime.now(timezone.utc)
    assert new_submission_without_user.latitude == 43.6532
    assert new_submission_without_user.longitude == -79.3832
    assert new_submission_without_user.issues == [IssueType.ABANDONDED]
    assert new_submission_without_user.parking_duration == ParkingDuration.MINUTES
    assert new_submission_without_user.parking_time == datetime_object
    assert new_submission_without_user.comments == "comments"
    assert (
        current_datetime - new_submission_without_user.submitted_datetime
    ).total_seconds() < 1
    assert new_submission_without_user.user_id is None


def test_new_submission_with_user(new_submission_with_user, new_base_user):
    """
    GIVEN a Submission model with new_base_user
    WHEN a new Submission is created
    THEN check that the properties are defined correctly
    """
    datetime_string = "2026-01-02 15:17:17.234235"
    datetime_object = datetime.strptime(datetime_string, "%Y-%m-%d %H:%M:%S.%f")
    current_datetime = datetime.now(timezone.utc)
    assert new_submission_with_user.latitude == 43.7532
    assert new_submission_with_user.longitude == -79.4832
    assert new_submission_with_user.issues == [IssueType.ABANDONDED]
    assert new_submission_with_user.parking_duration == ParkingDuration.MINUTES
    assert new_submission_with_user.parking_time == datetime_object
    assert new_submission_with_user.comments == "comments submission with user"
    assert (
        current_datetime - new_submission_with_user.submitted_datetime
    ).total_seconds() < 1
    assert new_submission_with_user.user_id == new_base_user.id
