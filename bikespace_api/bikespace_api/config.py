# bikespace_api/bikespace_api/config.py

import os

# Determine the folder of the top-level directory of this project
BASEDIR = os.path.abspath(os.path.dirname(__file__))


class BaseConfig:
    """Base configuration"""

    TESTING = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get("BIKESPACE_SECRET_KEY")
    SECURITY_PASSWORD_SALT = os.environ.get("BIKESPACE_SECURITY_PASSWORD_SALT")
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}
    FLASK_ADMIN_FLUID_LAYOUT = True
    FLASK_ADMIN_SWATCH = 'flatly'
    SECURITY_URL_PREFIX = "/admin/"
    SECURTY_LOGIN_URL = "/admin/login/"
    SECURITY_LOGOUT_URL = "/admin/logout/"
    SECURITY_REGISTER_URL = "/register/"

    SECURITY_POST_LOGIN_VIEW = "/admin/"
    SECURITY_POST_LOGOUT_VIEW = "/admin/"
    SECURITY_POST_REGISTER_VIEW = "/admin/"

    # Flask-Security features
    SECURITY_REGISTERABLE = False
    SECURITY_SEND_REGISTER_EMAIL = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class DevelopmentConfig(BaseConfig):
    """Development configuration"""

    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")


class TestingConfig(BaseConfig):
    """Testing configuration"""

    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get("TEST_DATABASE_URI")


class ProductionConfig(BaseConfig):
    """Production configuration"""

    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "").replace(
        "postgres://", "postgresql://"
    )
