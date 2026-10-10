from http import HTTPStatus

import marshmallow as ma
from flask.views import MethodView

from bikespace_api import db  # type: ignore
from bikespace_api.statuses import statuses_blueprint
from bikespace_api.statuses.statuses_models import BikeParkingStatus, StatusName


class BikeParkingStatusSchema(ma.Schema):
    id = ma.fields.Integer(dump_only=True)
    code = ma.fields.Enum(StatusName, by_value=True)
    label = ma.fields.String()
    internal_code = ma.fields.String()
    description = ma.fields.String()
    hide_by_default = ma.fields.Boolean()
    created_at = ma.fields.AwareDateTime(format="iso", dump_only=True)
    updated_at = ma.fields.AwareDateTime(format="iso", dump_only=True)


@statuses_blueprint.route("/bikeparking-statuses")
class BikeParkingStatuses(MethodView):
    """Bike parking issue status types"""

    @statuses_blueprint.response(HTTPStatus.OK, BikeParkingStatusSchema(many=True))
    def get(self):
        """Return all bike parking status types"""
        return db.session.execute(db.select(BikeParkingStatus)).scalars().all()
