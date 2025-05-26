# bikespace_api/bikespace_api/__init__.py

import os

from flask import Flask, redirect, render_template, url_for
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_admin import Admin
from flask_admin import helpers as admin_helpers
from flask_admin.contrib.sqla import ModelView
from flask_security import Security, SQLAlchemyUserDatastore
from flask_security import RoleMixin, UserMixin


# instantiate the db
db = SQLAlchemy()
migrate = Migrate()

def create_userdatastore(db: SQLAlchemy, user_model: UserMixin, role_model: RoleMixin):
    return SQLAlchemyUserDatastore(db, user_model, role_model)

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
    from bikespace_api.api.views import AdminSubmissionModelView, AdminUsersModelView, AdminRolesModelView
    from bikespace_api.api.models import Submission, User, Role

    global user_datastore
    #user_datastore = SQLAlchemyUserDatastore(db, User, Role)
    user_datastore = create_userdatastore(db, User, Role)
    security = Security(app, user_datastore)

    app.register_blueprint(submissions_blueprint, url_prefix="/api/v2")
    app.register_blueprint(docs_blueprint, url_prefix="/api/v2")

    admin = Admin(app, name='BikeSpace', template_mode='bootstrap3', base_template="my_master.html")
    admin.add_view(AdminRolesModelView(Role, db.session))
    admin.add_view(AdminUsersModelView(User, db.session))
    admin.add_view(AdminSubmissionModelView(Submission, db.session))

    @security.context_processor
    def security_context_processor():
        return dict(
            admin_base_template=admin.base_template,
            admin_view=admin.index_view,
            h=admin_helpers,
            get_url=url_for
        )

    @app.route("/admin/")
    def admin_index():
        return render_template("admin/index.html")

    @app.route("/")
    def api_home_page():
        return redirect("/api/v2/docs", code=302)

    # shell context for flask cli
    @app.shell_context_processor
    def ctx():
        return {"app": app, "db": db}

    return app
