from http import HTTPStatus

import marshmallow as ma
from flask.views import MethodView

from bikespace_api import db  # type: ignore
from bikespace_api.statuses import statuses_blueprint
from bikespace_api.statuses.statuses_models import BikeParkingStatus, StatusName


class BikeParkingStatusSchema(ma.Schema):
    id = ma.fields.Integer(dump_only=True)
    status_type = ma.fields.Enum(StatusName, by_value=True)
    status_type_label = ma.fields.String()
    status_name = ma.fields.String()
    status_description = ma.fields.String()
    hide_by_default = ma.fields.Boolean()
    created_at = ma.fields.AwareDateTime(format="iso", dump_only=True)
    updated_at = ma.fields.AwareDateTime(format="iso", dump_only=True)


class StatusesQueryArgsSchema(ma.Schema):
    include_hidden = ma.fields.Boolean(load_default=False)


@statuses_blueprint.route("/bikeparking-statuses")
class BikeParkingStatuses(MethodView):
    """Bike parking issue status types"""

    @statuses_blueprint.arguments(StatusesQueryArgsSchema, location="query")
    @statuses_blueprint.response(HTTPStatus.OK, BikeParkingStatusSchema(many=True))
    def get(self, args):
        """Return all bike parking status types"""
        query = db.select(BikeParkingStatus)
        if not args.get("include_hidden"):
            query = query.where(BikeParkingStatus.hide_by_default == False)  # noqa: E712
        return db.session.execute(query).scalars().all()
