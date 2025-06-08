from datetime import datetime, timezone

from pytest import mark

from bikespace_api.api.models import IssueType, ParkingDuration, Role, User


# uses new_submission fixture from conftest.py
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


@mark.parametrize("enum_val", [*IssueType, *ParkingDuration])
def test_enum_str(enum_val):
    """Test string representations returned by enums"""
    assert str(enum_val) == enum_val.name


def test_role_model_str():
    """Test string representation returned by Role model"""
    test_role = Role(name="test_name", description="test_description")
    assert str(test_role) == "test_name"


def test_user_model_str():
    """Test string representation returned by User model"""
    test_user = User(first_name="Jane", last_name="Doe", email="test@test.com")
    assert str(test_user) == "test@test.com"
