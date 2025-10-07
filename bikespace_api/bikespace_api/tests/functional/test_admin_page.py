from bikespace_api.api.models import Role, User
from bs4 import BeautifulSoup

def test_admin_page(test_client):

    """
    GIVEN a Flask application configured for testing
    WHEN the '/admin' page is requested (GET)
    THEN check that the response is valid
    """
    response = test_client.get("/admin/")
    soup = BeautifulSoup(response.data, 'html.parser')
    assert response.status_code == 200
    assert soup.find('h1', string="BikeSpace Admin")
    assert soup.find('a', class_="navbar-brand", href="/admin", string="BikeSpace")
    assert soup.find('a', class_="btn btn-primary", href="/admin/login", string="login")
    assert soup.find('a', href="/admin/", string="Home")

def test_admin_page_submision_without_logging_in(test_client):

    """
    GIVEN the flask application configured for testing
    WHEN the '/admin/submission/' page is requested (GET) without logging in
    THEN check that the response is a redirection to the login page
    """
    response = test_client.get("/admin/submission/", follow_redirects=True)
    soup = BeautifulSoup(response.data, 'html.parser')

    default_login_page_redirect(response, soup)

def test_admin_page_roles_without_logging_in(test_client):

    """
    GIVEN the flask application configured for testing
    WHEN the '/admin/roles/' page is requested (GET) without logging in
    THEN check that the response is a redirection to the login page
    """

    response = test_client.get("/admin/role/", follow_redirects=True)
    soup = BeautifulSoup(response.data, 'html.parser')

    default_login_page_redirect(response, soup)


def test_admin_page_user_without_logging_in(test_client):

    """
    GIVEN the flask application configured for testing
    WHEN the '/admin/user/' page is requested (GET) without logging in
    THEN check that the response is a redirection to the login page
    """
    response = test_client.get("/admin/user/", follow_redirects=True)
    soup = BeautifulSoup(response.data, 'html.parser')

    default_login_page_redirect(response, soup)

def default_login_page_redirect(response: str, soup: BeautifulSoup):
    assert response.status_code == 200 
    assert soup.find('h1', string="Login")
    assert soup.find('a', class_="navbar-brand", href="/admin", string="BikeSpace")
    assert soup.find('input', id="submit", class_="btn btn-primary", type="submit", value="Login")
    assert soup.find('a', href="/admin/", string="Home")

def test_admin_login_successfully(test_client):
    
    """
    GIVEN the flask application configured for testing
    WHEN the '/admin/login' page is posted to (POST) with valid credentials
    THEN check that the response is a redirection to the admin home page
    """

    response = test_client.post(
        "/admin/login",
        data=dict(email="admin@example.com", password="admin"),
        follow_redirects=True)
    soup = BeautifulSoup(response.data, 'html.parser')

    assert response.status_code == 200
    assert soup.find('a', class_="navbar-brand", href="/admin", string="BikeSpace")
    assert soup.find('a', href="/admin/", string="Home")
    assert not soup.find('a', class_="btn btn-primary", href="/admin/login", string="login")
    assert soup.find('a', href="/admin/", string="Home")

