from bikespace_api.api.models import Submission, IssueType, ParkingDuration
from datetime import datetime, timezone


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

def test_role_creation(new_base_user_role):
    """
    GIVEN a Role model
    WHEN a new Role is created
    THEN check the id, name, and description fields are set correctly
    """
    assert new_base_user_role.id == 1
    assert new_base_user_role.name == "user"
    assert new_base_user_role.description == "Base user role"

def test_role_str(new_base_user_role):
    """
    GIVEN a Role model
    WHEN __str__ is called
    THEN check that the role name is returned
    """
    assert str(new_base_user_role) == "user"

def test_base_user_creation(new_base_user, new_base_user_role):
    """
    GIVEN a User model
    WHEN a new User is created
    THEN check the id, first_name, last_name, email, password, active, confirmed_at and roles fields are set correctly
    """
    assert new_base_user.id == 1
    assert new_base_user.first_name == "Test"
    assert new_base_user.last_name == "User"
    assert new_base_user.email == "test.user@example.com"
    assert new_base_user.password == "password"
    assert new_base_user.active is True
    assert (datetime.now() - new_base_user.confirmed_at).total_seconds() < 1