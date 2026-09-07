from http import HTTPStatus

import marshmallow as ma
from flask_security import auth_required, current_user  # type: ignore

from bikespace_api.admin import admin_blueprint


class UserInfoSchema(ma.Schema):
    id = ma.fields.Integer(dump_only=True)
    username = ma.fields.String(dump_only=True)
    email = ma.fields.String(dump_only=True)
    active = ma.fields.Boolean(dump_only=True)
    confirmed_at = ma.fields.DateTime(format="iso", dump_only=True)
    first_name = ma.fields.String(required=False, dump_only=True)
    last_name = ma.fields.String(required=False, dump_only=True)


@admin_blueprint.route("/users/me", methods=["GET"])
@admin_blueprint.response(HTTPStatus.OK, UserInfoSchema)
@auth_required()
@admin_blueprint.doc(security=[{"apiKeyAuth": []}])
def get_current_user():
    """Return information about the currently logged in user"""
    return current_user
