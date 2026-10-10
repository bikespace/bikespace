from datetime import datetime, timezone

from bikespace_api.statuses.statuses_models import BikeParkingStatus, StatusName


def test_status_name_enum_string_methods():
    """
    GIVEN the StatusName enum
    WHEN __str__ is called
    THEN the enum's name property is returned
    """
    for member in StatusName:
        assert str(member) == member.name


def test_new_bikeparking_status_defaults():
    """
    GIVEN a BikeParkingStatus model
    WHEN a new status is created with only required fields
    THEN hide_by_default is False and timestamps are set to approximately now
    """
    before = datetime.now(timezone.utc)
    status = BikeParkingStatus(
        code=StatusName.ACTION_REQUIRED,
        internal_code="new_report",
        description="Issue has been reported but no action taken yet",
    )
    after = datetime.now(timezone.utc)

    assert status.code == StatusName.ACTION_REQUIRED
    assert status.internal_code == "new_report"
    assert status.description == "Issue has been reported but no action taken yet"
    assert status.hide_by_default is False
    assert before <= status.created_at <= after
    assert before <= status.updated_at <= after


def test_new_bikeparking_status_hide_by_default_true():
    """
    GIVEN a BikeParkingStatus model
    WHEN hide_by_default is set to True
    THEN the field is stored correctly
    """
    status = BikeParkingStatus(
        code=StatusName.CLOSED_UNRESOLVED,
        internal_code="archived",
        description="Issue closed; no recent action taken",
        hide_by_default=True,
    )
    assert status.hide_by_default is True


def test_all_status_name_enum_values():
    """
    GIVEN the StatusName enum
    WHEN all values are checked
    THEN all six expected values are present
    """
    expected_values = {
        "action_required",
        "resolution_pending",
        "resolved_success",
        "resolved_informational",
        "closed_unresolved",
        "invalid_submission",
    }
    assert {m.value for m in StatusName} == expected_values
