import json

def test_get_submissions(test_client):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/api/v2/submissions' page is requested (GET)
    THEN check that the response is Valid
    """
    response = test_client.get("/api/v2/submissions")
    res = json.loads(response.get_data())
    assert response.status_code == 200
    assert response.headers['Content-Type'] == "application/json"
