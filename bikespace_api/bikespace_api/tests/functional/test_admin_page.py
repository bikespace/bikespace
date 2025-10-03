from bikespace_api.api.models import Role, User

def test_admin_page(test_client):

    """
    GIVEN a Flask application configured for testing
    WHEN the '/admin' page is requested (GET)
    THEN check that the response is valid
    """
    response = test_client.get("/admin/")
    assert response.status_code == 200
    assert b"<a class=\"navbar-brand\" href=\"/admin\">BikeSpace</a>" in response.data
    assert b"<a class=\"btn btn-primary\" href=\"/admin/login\">login</a>" in response.data
    assert b"<a href=\"/admin/\">Home</a>" in response.data
    assert b"<a class=\"btn btn-primary\" href=\"/\">" in response.data