# bikespace_api/bikespace_api/__init__.py

import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy

# instantiate the db
db = SQLAlchemy()


def create_app(script_info=None):
    # instantiante the app
    app = Flask(__name__)

    # set config
    app_settings = os.getenv("APP_SETTINGS")
    app.config.from_object(app_settings)

    # set up extensions
    db.init_app(app)

    # register blueprints
    from bikespace_api.api.answers import answers_blueprint
    from bikespace_api.api.docs import docs_blueprint

    app.register_blueprint(answers_blueprint, url_prefix="/api/v2")
    app.register_blueprint(docs_blueprint, url_prefix="/api/v2")

    # shell context for flask cli
    @app.shell_context_processor
    def ctx():
        return {"app": app, "db": db}

    return app
