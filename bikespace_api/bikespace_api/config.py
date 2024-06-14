# bikespace_api/bikespace_api/config.py

import os

# Determine the folder of the top-level directory of this project
BASEDIR = os.path.abspath(os.path.dirname(__file__))


class BaseConfig:
    """Base configuration"""

    TESTING = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get("FLASK_SECRET_KEY")
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}


class DevelopmentConfig(BaseConfig):
    """Development configuration"""

    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")


class TestingConfig(BaseConfig):
    """Testing configuration"""

    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get("TEST_DATABASE_URI")


class ProductionConfig(BaseConfig):
    """Production configuration"""

    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")
