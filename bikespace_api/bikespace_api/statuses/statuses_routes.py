from http import HTTPStatus

import marshmallow as ma
from better_profanity import profanity
from flask.views import MethodView
from flask_security import current_user
from sqlalchemy.exc import IntegrityError

from bikespace_api import db  # type: ignore
from bikespace_api.statuses import statuses_blueprint
from bikespace_api.statuses.statuses_models import (
    BikeParkingStatus,
    ModerationStatus,
    StatusName,
    SubmissionComment,
    VisibilityStatus,
)


class UserSchema(ma.Schema):
    """Partial schema for User fields used by SubmissionUpdate handling"""

    id = ma.fields.Integer(dump_only=True)
    username = ma.fields.String(allow_none=True)


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


class SubmissionCommentSchema(ma.Schema):
    id = ma.fields.Integer(dump_only=True)
    submission_ids = ma.fields.List(
        ma.fields.Integer(),
        required=True,
        validate=ma.validate.Length(min=1),
    )
    user = ma.fields.Pluck(UserSchema, "username")
    comments = ma.fields.String(validate=ma.validate.Length(max=5000))
    visibility = ma.fields.Enum(VisibilityStatus, by_value=True)
    submitted_datetime = ma.fields.AwareDateTime(format="iso", dump_only=True)
    moderation_status = ma.fields.Enum(
        ModerationStatus,
        by_value=True,
        dump_only=True,
    )


# TODO status should just be a single string option here


class SubmissionCommentCreateConfirmationSchema(ma.Schema):
    status = ma.fields.Constant("created")
    submission_comment_id = ma.fields.Integer()


class SubmissionCommentCreateErrorSchema(ma.Schema):
    code = ma.fields.Constant(HTTPStatus.INTERNAL_SERVER_ERROR)
    status = ma.fields.Constant("error")
    message = ma.fields.Constant("internal server error")
    # TODO add errors as a dict of string key values
    # TODO document where this error format comes from?


# TODO should HTTPStatus.CREATED be sent if there's an error? Should I add an alternative response?


@statuses_blueprint.route("/comments", methods=["POST"])
@statuses_blueprint.arguments(SubmissionCommentSchema)
@statuses_blueprint.response(
    HTTPStatus.CREATED, SubmissionCommentCreateConfirmationSchema
)
@statuses_blueprint.alt_response(
    HTTPStatus.INTERNAL_SERVER_ERROR,
    schema=SubmissionCommentCreateErrorSchema,
    success=False,
)
@statuses_blueprint.doc(
    security=[
        {},  # authentication optional
        {"apiKeyAuth": []},
    ]
)
def post_submission_comment(new_data):
    """Docstring TODO"""
    profanity.load_censor_words()
    censored_comments = profanity.censor(new_data["comments"])

    # TODO make visibility privilege gated
    # should warn and reject if the user tries to set it to private and they don't have the right privileges
    # see: https://flask-security-too.readthedocs.io/en/stable/patterns.html#authentication-and-authorization

    try:
        new_submission_comment = SubmissionComment(
            submission_ids=new_data["submission_ids"],
            user_id=current_user.id if current_user else None,
            comments=censored_comments,
            visibility=new_data["visibility"],
        )
        db.session.add(new_submission_comment)
        db.session.commit()
        return (
            {
                "status": "created",
                "submission_comment_id": new_submission_comment.id,
            },
            HTTPStatus.CREATED,
        )
    except IntegrityError:
        db.session.rollback()
        return (
            {
                "code": 500,
                "status": "error",
                "message": "internal server error",
            },
            HTTPStatus.INTERNAL_SERVER_ERROR,
        )
