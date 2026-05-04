from datetime import datetime


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
    THEN check the id, first_name, last_name, email, password, active, confirmed_at and roles fields are set correctly and that the string representation of the user is their email
    """
    assert new_base_user.id == 1
    assert new_base_user.first_name == "Test"
    assert new_base_user.last_name == "User"
    assert new_base_user.email == "test.user@example.com"
    assert new_base_user.password == "password"
    assert new_base_user.active is True
    assert (datetime.now() - new_base_user.confirmed_at).total_seconds() < 1
    assert str(new_base_user) == new_base_user.email
