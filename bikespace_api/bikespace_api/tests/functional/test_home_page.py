from bikespace_api import create_app
import os


def test_home_page(test_client):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/' page is requested (GET)
    THEN check that the response is Valid
    """

    response = test_client.get("/", follow_redirects=True)
    assert response.status_code == 200
    assert response.request.path == "/api/v2/docs"
