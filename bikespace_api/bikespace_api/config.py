import os

# Determine the folder of the top-level directory of this project
BASEDIR = os.path.abspath(os.path.dirname(__file__))


class BaseConfig:
    """Base configuration"""

    # flask
    TESTING = False
    SECRET_KEY = os.environ.get("BIKESPACE_SECRET_KEY")

    # flask-sqlalchemy
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}

    # flask-admin
    FLASK_ADMIN_FLUID_LAYOUT = True
    FLASK_ADMIN_SWATCH = "flatly"

    # flask-security configuration
    SECURITY_PASSWORD_SALT = os.environ.get("BIKESPACE_SECURITY_PASSWORD_SALT")
    SECURITY_SEND_REGISTER_EMAIL = False
    SECURITY_ANONYMOUS_USER_DISABLED = True
    SECURITY_USERNAME_ENABLE = True

    # flask-security endpoints
    SECURITY_REGISTERABLE = False  # enable user registration; default False
    SECURITY_RECOVERABLE = False  # enable password reset/recover; default False
    SECURITY_TRACKABLE = (
        False  # track user login statistics, requires additional set-up; default False
    )
    SECURITY_CHANGEABLE = False  # enable change password; default False
    SECURITY_CONFIRMABLE = (
        False  # require email confirmation in registration flow; default False
    )
    SECURITY_UNIFIED_SIGNIN = False  # enable login with TOTP; default False
    SECURITY_USERNAME_RECOVERY = (
        False  # enable username recovery with email; default False
    )

    # flask-security routes
    SECURITY_URL_PREFIX = "/admin/"  # default None
    SECURITY_LOGIN_URL = "/login/"  # default /login
    SECURITY_LOGOUT_URL = "/logout/"  # default /logout
    SECURITY_REGISTER_URL = "/register/"  # default /register
    SECURITY_POST_LOGIN_VIEW = "/admin/"  # default /
    SECURITY_POST_LOGOUT_VIEW = "/admin/"  # default /
    SECURITY_POST_REGISTER_VIEW = (
        "/admin/"  # default None (falls back to SECURITY_POST_LOGIN_VIEW)
    )
    # SECURITY_USERNAME_RECOVERY_URL = "/recover-username/"

    SECURITY_REDIRECT_BEHAVIOR = "spa"
    SECURITY_POST_CONFIRM_VIEW = "/confirmed/"
    SECURITY_CONFIRM_ERROR_VIEW = "/confirm-error/"
    SECURITY_RESET_VIEW = "/reset-password/"
    SECURITY_RESET_ERROR_VIEW = "/reset-password-error/"
    SECURITY_LOGIN_ERROR_VIEW = "/login-error/"
    # SECURITY_POST_CHANGE_EMAIL_VIEW
    # SECURITY_CHANGE_EMAIL_ERROR_VIEW
    # SECURITY_POST_OAUTH_LOGIN_VIEW = "/post-oauth-login/"
    # SECURITY_POST_OAUTH_VERIFY_VIEW = "/post-oauth-verify/"
    # SECURITY_VERIFY_ERROR_VIEW = "/verify-error/"

    # enforce CSRF protection for session / browser - but allow token-based API calls to go through
    SECURITY_CSRF_PROTECT_MECHANISMS = ["session", "basic"]
    # Enable/disable pre-request CSRF; must be set to False if CSRF_PROTECT_MECHANISMS is set
    WTF_CSRF_CHECK_DEFAULT = False
    SECURITY_CSRF_IGNORE_UNAUTH_ENDPOINTS = True  # allow API-based login

    # flask-smorest
    API_TITLE = "BikeSpace API"
    API_VERSION = "2.1.0"
    OPENAPI_VERSION = "3.1.1"
    OPENAPI_URL_PREFIX = "/api/v2/"
    OPENAPI_SWAGGER_UI_PATH = "/docs/"
    OPENAPI_SWAGGER_UI_URL = "/static/swagger-ui-dist/"
    login_instructions = "\n".join(
        (
            "---",
            "### Instructions:",
            "Make a POST request to /admin/login/ to get an authentication token to enter below, e.g.:",
            "```bash",
            "curl -X 'POST' \\",
            "'http://localhost:8000/admin/login/?include_auth_token' \\",
            "-H 'Content-Type: application/json' \\",
            '-d \'{"email": "email@example.com","password": "mypassword"}\'',
            "```",
            "---",
        )
    )
    API_SPEC_OPTIONS = {
        "components": {
            "securitySchemes": {
                "apiKeyAuth": {
                    "type": "apiKey",
                    "in": "header",
                    "name": "Authentication-Token",
                    "description": login_instructions,
                }
            }
        },
    }

    # Seed User
    SEED_USER_EMAIL = os.environ.get("SEED_USER_EMAIL")
    SEED_USER_PASSWORD = os.environ.get("SEED_USER_PASSWORD")


class DevelopmentConfig(BaseConfig):
    """Development configuration"""

    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")


class TestingConfig(BaseConfig):
    """Testing configuration"""

    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get("TEST_DATABASE_URI")

    # flask-security (disable CSRF for testing)
    WTF_CSRF_ENABLED = False


class ProductionConfig(BaseConfig):
    """Production configuration"""

    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "").replace(
        "postgres://", "postgresql://"
    )
