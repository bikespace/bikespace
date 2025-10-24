import re

from bs4 import BeautifulSoup
from pytest import mark

from bikespace_api.api.models import Role, User

# Rationale for 'type: ignore' comments: soup.find doesn't have an overload where both name= and string= are not None (as of bs4 version 4.14.2), even though this is a documented usage of the function


def test_admin_page(test_client):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/admin' page is requested (GET)
    THEN check that the response is valid
    """
    response = test_client.get("/admin/")
    soup = BeautifulSoup(response.data, "html.parser")
    assert response.status_code == 200
    assert soup.find("h1", string="BikeSpace Admin")  # type: ignore
    assert soup.find("a", class_="navbar-brand", href="/admin", string="BikeSpace")  # type: ignore
    assert soup.find("a", class_="btn btn-primary", href="/admin/login", string="login")  # type: ignore
    assert soup.find("a", href="/admin/", string="Home")  # type: ignore


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
    assert soup.find("h1", string="Login")  # type: ignore
    assert soup.find("a", class_="navbar-brand", href="/admin", string="BikeSpace")  # type: ignore
    assert soup.find(
        "input", id="submit", class_="btn btn-primary", type="submit", value="Login"
    )
    assert soup.find("a", href="/admin/", string="Home")  # type: ignore


def test_admin_login_successfully(test_client):
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
        string="login",  # type: ignore
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
        string="login",  # type: ignore
    )
    assert post_login_soup.find(string=re.compile("Admin"))


def test_allowed_pages_for_regular_users(test_client):
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
