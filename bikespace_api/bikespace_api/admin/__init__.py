from flask_smorest import Blueprint

admin_blueprint = Blueprint(
    "admin_routes",
    __name__,
    template_folder="templates",
)

# register routes with blueprint
from bikespace_api.admin import admin_routes
