import re

import pytest
from bs4 import BeautifulSoup
from pytest import mark

# Rationale for 'type: ignore' comments:
# - soup.find doesn't have an overload where both name= and string= are not None (as of bs4 version 4.14.2), even though this is a documented usage of the function
# - soup.find string= parameter is not typed for regular expressions even though these are a documented input type


@pytest.fixture()
def logged_in_admin_client(test_client, clean_db):
    test_client.post(
        "/admin/login",
        data=dict(email="admin@example.com", password="admin"),
        follow_redirects=True,
    )
    return test_client


def test_admin_page(test_client):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/admin' page is requested (GET)
    THEN check that the response is valid
    """
    response = test_client.get("/admin/")
    soup = BeautifulSoup(response.data, "html.parser")
    container_div = soup.find("div", class_="container")
    navbar_div = soup.find("div", class_="collapse navbar-collapse")
    assert response.status_code == 200
    assert container_div.find(  # type: ignore
        "h1",
        string=re.compile("BikeSpace Admin", flags=re.IGNORECASE),  # type: ignore
    )  # type: ignore
    assert soup.find(
        "a",
        class_="btn btn-primary",
        href="/admin/login",
        string=re.compile("login", flags=re.IGNORECASE),  # type: ignore
    )
    assert navbar_div.find(  # type: ignore
        "a",
        class_="navbar-brand",
        href="/admin",
        string=re.compile("BikeSpace", flags=re.IGNORECASE),  # type: ignore
    )
    assert navbar_div.find(  # type: ignore
        "a",
        class_="nav-link",
        href="/admin/",
        string=re.compile("Home", flags=re.IGNORECASE),  # type: ignore
    )


def test_admin_page_submission_without_logging_in(test_client):
    """
    GIVEN the flask application configured for testing
    WHEN the '/admin/submission/' page is requested (GET) without logging in
    THEN check that the response is a redirection to the login page
    """
    response = test_client.get("/admin/submission/", follow_redirects=True)
    soup = BeautifulSoup(response.data, "html.parser")

    default_login_page_redirect(response, soup)


def test_admin_page_roles_without_logging_in(test_client):
    """
    GIVEN the flask application configured for testing
    WHEN the '/admin/roles/' page is requested (GET) without logging in
    THEN check that the response is a redirection to the login page
    """

    response = test_client.get("/admin/role/", follow_redirects=True)
    soup = BeautifulSoup(response.data, "html.parser")

    default_login_page_redirect(response, soup)


def test_admin_page_user_without_logging_in(test_client):
    """
    GIVEN the flask application configured for testing
    WHEN the '/admin/user/' page is requested (GET) without logging in
    THEN check that the response is a redirection to the login page
    """
    response = test_client.get("/admin/user/", follow_redirects=True)
    soup = BeautifulSoup(response.data, "html.parser")

    default_login_page_redirect(response, soup)


def default_login_page_redirect(response, soup: BeautifulSoup):
    assert response.status_code == 200
    container_div = soup.find("div", class_="container")
    navbar_div = soup.find("div", class_="collapse navbar-collapse")
    assert container_div.find("h1", string=re.compile("Login", flags=re.IGNORECASE))  # type: ignore
    assert soup.find(
        "a",
        class_="navbar-brand",
        href="/admin",
        string=re.compile("BikeSpace", flags=re.IGNORECASE),  # type: ignore
    )  # type: ignore
    assert soup.find(
        "input", id="submit", class_="btn btn-primary", type="submit", value="Login"
    )
    assert navbar_div.find(  # type: ignore
        "a",
        class_="nav-link",
        href="/admin/",
        string=re.compile("Home", flags=re.IGNORECASE),  # type: ignore
    )


@mark.uses_db
def test_admin_login_successfully(test_client, clean_db):
    """
    GIVEN the flask application configured for testing
    WHEN the '/admin/login' page is posted to (POST) with valid credentials
    THEN check that the response is a redirection to the admin home page
    """
    pre_login_response = test_client.get("/admin/")
    assert pre_login_response.status_code == 200

    pre_login_soup = BeautifulSoup(pre_login_response.data, "html.parser")
    assert pre_login_soup.find(
        "a",
        class_="btn btn-primary",
        href="/admin/login",
        string=re.compile("login", flags=re.IGNORECASE),  # type: ignore
    )

    post_login_response = test_client.post(
        "/admin/login",
        data=dict(email="admin@example.com", password="admin"),
        follow_redirects=True,
    )
    assert post_login_response.status_code == 200

    post_login_soup = BeautifulSoup(post_login_response.data, "html.parser")
    assert not post_login_soup.find(
        "a",
        class_="btn btn-primary",
        href="/admin/login",
        string=re.compile("login", flags=re.IGNORECASE),  # type: ignore
    )
    assert post_login_soup.find(string=re.compile("Admin"))


@mark.uses_db
def test_create_and_update_a_user(logged_in_admin_client):
    """
    GIVEN the flask application configured for testing
    WHEN the flask-admin endpoints are used to create a user and then update their password
    THEN check that the user is created and the password update is successful
    """
    test_client = logged_in_admin_client
    # create a new regular user using the flask-admin endpoint
    new_user_properties = dict(
        first_name="Test",
        last_name="New User",
        email="testnewuser@example.com",
        password="testnewuserpassword",
        roles=["user"],
        active=True,
    )
    create_response = test_client.post(
        "/admin/user/new/",
        data=new_user_properties,
    )

    # confirm the new user was created
    read_response_1 = test_client.get("/admin/user/")
    read_soup_1 = BeautifulSoup(read_response_1.text, "html.parser")
    assert read_soup_1.find(string=re.compile(str(new_user_properties["email"])))

    # get the edit endpoint for the new user
    # (i.e. `/admin/user/edit/?id={{user_id}}&url=/admin/user/`)
    user_edit_url = (
        read_soup_1.find(
            "td",
            string=re.compile(str(new_user_properties["email"])),  # type: ignore
        )
        .parent.find("a", title="Edit Record")
        .get("href")
    )

    # update the new user's password
    update_response = test_client.post(
        user_edit_url,
        data=dict(
            first_name=new_user_properties["first_name"],
            last_name=new_user_properties["last_name"],
            email=new_user_properties["email"],
            active=new_user_properties["active"],
            password="testupdatedpassword",
        ),
        follow_redirects=True,
    )

    # confirm that the update was successful
    read_soup_2 = BeautifulSoup(update_response.text, "html.parser")
    assert read_soup_2.find(
        string=re.compile("record was successfully saved", flags=re.IGNORECASE)
    )


@mark.uses_db
def test_admin_submission_create_form_renders(logged_in_admin_client):
    """
    GIVEN a logged-in superuser
    WHEN the admin submission create form is requested
    THEN the form renders successfully (exercising DateTimeWithMicrosecondsField.__init__)
    """
    response = logged_in_admin_client.get("/admin/submission/new/")
    assert response.status_code == 200
    soup = BeautifulSoup(response.data, "html.parser")
    assert soup.find("form")


@mark.uses_db
def test_admin_roles_accessible_as_superuser(logged_in_admin_client):
    """
    GIVEN a logged-in superuser
    WHEN the admin roles list page is requested
    THEN the page loads successfully (covering the _handle_view is_accessible True branch)
    """
    response = logged_in_admin_client.get("/admin/role/")
    assert response.status_code == 200
    soup = BeautifulSoup(response.data, "html.parser")
    assert soup.find("table")


@mark.uses_db
def test_update_user_without_changing_password(logged_in_admin_client):
    """
    GIVEN a logged-in superuser and an existing user
    WHEN a non-password field is updated without supplying a new password
    THEN the field change is saved and the original password hash is preserved
    """
    from flask_security.utils import verify_password

    from bikespace_api import db
    from bikespace_api.admin.admin_models import User

    test_client = logged_in_admin_client
    original_password = "originalpassword"

    # create a user to edit
    test_client.post(
        "/admin/user/new/",
        data=dict(
            first_name="Original",
            last_name="Password",
            email="nopasswordchange@example.com",
            password=original_password,
            roles=["user"],
            active=True,
        ),
    )

    # find the edit URL for the new user
    read_response = test_client.get("/admin/user/")
    read_soup = BeautifulSoup(read_response.text, "html.parser")
    user_edit_url = (
        read_soup.find("td", string=re.compile("nopasswordchange@example.com"))  # type: ignore
        .parent.find("a", title="Edit Record")
        .get("href")
    )

    # update first_name without providing a new password
    update_response = test_client.post(
        user_edit_url,
        data=dict(
            first_name="Updated",
            last_name="Password",
            email="nopasswordchange@example.com",
            active=True,
            password="",  # empty password → on_model_change skips hashing
        ),
        follow_redirects=True,
    )
    assert update_response.status_code == 200
    assert BeautifulSoup(update_response.data, "html.parser").find(
        string=re.compile("record was successfully saved", flags=re.IGNORECASE)
    )

    # verify the name change appears in the list view
    list_soup = BeautifulSoup(test_client.get("/admin/user/").data, "html.parser")
    assert list_soup.find(string=re.compile("Updated"))

    # verify the original password hash was not touched
    app = test_client.application
    with app.app_context():
        user = db.session.execute(
            db.select(User).filter_by(email="nopasswordchange@example.com")
        ).scalar_one()
        assert verify_password(original_password, user.password)


@mark.uses_db
def test_allowed_pages_for_regular_users(test_client, clean_db):
    """
    GIVEN the flask application configured for testing and
    GIVEN a user logged in with the "user" role but not "superuser"
    WHEN view pages are requested
    THEN check that the user has or does not have access, according to their permissions
    """

    # login the non-admin user
    login_response = test_client.post(
        "/admin/login",
        data=dict(email="notanadmin@example.com", password="notanadmin"),
        follow_redirects=True,
    )
    assert login_response.status_code == 200
    soup = BeautifulSoup(login_response.data, "html.parser")
    assert soup.find(string=re.compile("Not an Admin"))

    # test responses for model pages
    pages_and_expected_responses = [
        ("/admin/", 200),
        ("/admin/role/", 403),
        ("/admin/user/", 403),
        ("/admin/submission/", 403),
    ]

    for page_url, expected_response in pages_and_expected_responses:
        response = test_client.get(page_url, follow_redirects=False)
        assert response.status_code == expected_response
