# bikespace_api/bikespace_api/__init__.py

import os

from flask import Flask, redirect, render_template
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_security import Security, SQLAlchemyUserDatastore, auth_required
from flask_security.models import fsqla_v3 as fsqla

# instantiate the db
db = SQLAlchemy()
migrate = Migrate()
security = Security()


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

    # Define models
    from bikespace_api.api.models import Role, User
    
    #Setup Flask-Security
    user_datastore = SQLAlchemyUserDatastore(db, User, Role)  
    security.init_app(app, user_datastore)

    # register blueprints
    from bikespace_api.api.submissions import submissions_blueprint
    from bikespace_api.api.docs import docs_blueprint

    app.register_blueprint(submissions_blueprint, url_prefix="/api/v2")
    app.register_blueprint(docs_blueprint, url_prefix="/api/v2")

    @app.route("/login")
    @auth_required()
    def login():
        return render_template("Hello {{ current_user.email }}")
    

    @app.route("/")
    def api_home_page():
        return redirect("/api/v2/docs", code=302)

    # shell context for flask cli
    @app.shell_context_processor
    def ctx():
        return {"app": app, "db": db}

    return app
