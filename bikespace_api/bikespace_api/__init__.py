# bikespace_api/bikespace_api/__init__.py

import os
from flask import Flask, redirect
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# instantiate the db
db = SQLAlchemy()
migrate = Migrate()


def create_app(script_info=None):
    # instantiante the app
    app = Flask(__name__)
    CORS(app)

    # set config
    app_settings = os.getenv("APP_SETTINGS")
    app.config.from_object(app_settings)

    # set up extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # register blueprints
    from bikespace_api.api.submissions import submissions_blueprint
    from bikespace_api.api.docs import docs_blueprint

    app.register_blueprint(submissions_blueprint, url_prefix="/api/v2")
    app.register_blueprint(docs_blueprint, url_prefix="/api/v2")

    @app.route("/")
    def api_home_page():
        return redirect("/api/v2/docs", code=302)

    # shell context for flask cli
    @app.shell_context_processor
    def ctx():
        return {"app": app, "db": db}

    return app
