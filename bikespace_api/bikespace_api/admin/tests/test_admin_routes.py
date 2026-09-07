from http import HTTPStatus

import pytest
from bikespace_api.admin.admin_models import User
from bikespace_api.seed import non_admin_user


class TestGetUserInfo:
    "Tests for GET /user/*"

    @pytest.mark.uses_db
    def test_get_user_me_logged_in(
        self,
        test_client,
        flask_app,
        token_auth_headers_regular_user,
    ):
        """
        GIVEN a Flask application configured for testing
        GIVEN a logged-in user
        WHEN the user requests their profile info from /users/me
        THEN the correct response is received
        """
        with flask_app.app_context():
            response = test_client.get(
                "/users/me",
                headers=token_auth_headers_regular_user,
            )
            user = User.query.filter_by(username=non_admin_user["username"]).first()

        assert response.status_code == HTTPStatus.OK
        assert response.json["id"] == user.id
        assert response.json["username"] == user.username
        assert response.json["email"] == user.email
        assert response.json["active"] == user.active
        assert response.json["confirmed_at"] == user.confirmed_at
        assert response.json["first_name"] == user.first_name
        assert response.json["last_name"] == user.last_name

    @pytest.mark.uses_db
    def test_get_user_me_logged_out(
        self,
        test_client,
        flask_app,
    ):
        """
        GIVEN a Flask application configured for testing
        GIVEN no logged in user
        WHEN a request is made to /users/me
        THEN a 401 unauthorized error response is received
        """
        with flask_app.app_context():
            response = test_client.get(
                "/users/me", headers={"Accept": "application/json"}
            )

        assert response.status_code == HTTPStatus.UNAUTHORIZED
