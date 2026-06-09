from flask_smorest import Blueprint

submissions_blueprint = Blueprint(
    "submissions",
    __name__,
    description="User reports of bicycle parking problems",
)

# register routes with blueprint
from bikespace_api.submissions import submissions_routes
