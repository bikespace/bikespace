from flask_smorest import Blueprint

submissions_blueprint = Blueprint(
    "submissions",
    __name__,
    description="User reports of bicycle parking problems",
)

# register routes with blueprint
from bikespace_api.submissions import submissions_routes

# register nested blueprints
from bikespace_api.statuses import statuses_blueprint
submissions_blueprint.register_blueprint(statuses_blueprint, url_prefix="/submissions")
