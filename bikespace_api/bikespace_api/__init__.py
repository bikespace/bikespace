# bikespace_api/bikespace_api/__init__.py

import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

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
    limiter = Limiter(
        get_remote_address,
        app=app,
        default_limits=["200 per day", "50 per hour", "1 per second"],
        storage_uri = app.config.get("BIKESPACE_REDIS_URI") 
    )

    app.register_blueprint(submissions_blueprint)
    app.register_blueprint(docs_blueprint)

    limiter.limit("1/second")(submissions_blueprint)

    # shell context for flask cli
    @app.shell_context_processor
    def ctx():
        return {"app": app, "db": db}

    return app
