from flask_smorest import Blueprint

statuses_blueprint = Blueprint(
    "statuses",
    __name__,
    description="Bike parking issue status types",
)

# register routes with blueprint
from bikespace_api.statuses import statuses_routes
