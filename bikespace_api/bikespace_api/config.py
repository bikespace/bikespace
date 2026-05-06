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
    SECURITY_REGISTERABLE = False  # whether to create a user registration endpoint
    SECURITY_SEND_REGISTER_EMAIL = False

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

    # flask-smorest
    API_TITLE = "BikeSpace API"
    API_VERSION = "2.0.4"
    OPENAPI_VERSION = "3.1.1"
    OPENAPI_URL_PREFIX = "/api/v2/"
    OPENAPI_SWAGGER_UI_PATH = "/docs/"
    OPENAPI_SWAGGER_UI_URL = "/static/swagger-ui-dist/"

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
