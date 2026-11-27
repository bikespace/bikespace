from http import HTTPStatus

import marshmallow as ma
from better_profanity import profanity
from flask.views import MethodView
from flask_security import auth_required, current_user, roles_accepted
from flask_smorest import abort
from sqlalchemy.exc import IntegrityError

from bikespace_api import db  # type: ignore
from bikespace_api.admin.roles import ApplicationRoles
from bikespace_api.statuses import statuses_blueprint
from bikespace_api.statuses.statuses_models import (
    BikeParkingStatus,
    SubmissionComment,
    SubmissionStatusUpdate,
)
from bikespace_api.statuses.statuses_schemas import (
    BikeParkingStatusSchema,
    SubmissionCommentSchema,
    SubmissionStatusUpdateSchema,
)
from bikespace_api.submissions.submissions_models import Submission

# SHARED SCHEMAS AND HELPERS
# --------------------------


def get_submissions_or_404(submission_ids: list[int]) -> list[Submission]:
    """Docstring TODO"""

    ids = set(submission_ids)
    submissions = db.session.scalars(
        db.select(Submission).where(Submission.id.in_(ids))
    ).all()
    missing = ids - {s.id for s in submissions}
    if missing:
        abort(
            HTTPStatus.NOT_FOUND,
            message=f"Could not find submissions {', '.join(map(str, sorted(missing)))}",
        )
    return submissions


# STATUS TYPES
# ------------


@statuses_blueprint.route("/bikeparking-statuses")
class BikeParkingStatuses(MethodView):
    """Bike parking issue status types"""

    @statuses_blueprint.response(HTTPStatus.OK, BikeParkingStatusSchema(many=True))
    def get(self):
        """Return all bike parking status types"""
        return db.session.execute(db.select(BikeParkingStatus)).scalars().all()


# SUBMISSION STATUS UPDATES
# -------------------------


class SubmissionStatusUpdateCreateConfirmationSchema(ma.Schema):
    status = ma.fields.Constant("created")
    submission_status_update_id = ma.fields.Integer()
    # TODO should this confirmation also return the list of submission ids?


# TODO implement GET and PATCH routes


@statuses_blueprint.route("/status-updates", methods=["POST"])
@statuses_blueprint.arguments(SubmissionStatusUpdateSchema)
@statuses_blueprint.response(
    HTTPStatus.CREATED, SubmissionStatusUpdateCreateConfirmationSchema
)
@statuses_blueprint.doc(
    security=[
        {"apiKeyAuth": []},
    ]
)
@auth_required()
@roles_accepted(ApplicationRoles.SUPERUSER, ApplicationRoles.EDITOR)
def post_submission_status_update(new_data):
    """Docstring TODO"""
    profanity.load_censor_words()
    censored_comments = (
        profanity.censor(new_data["comments"]) if new_data.get("comments") else None
    )

    submissions = get_submissions_or_404(new_data["submission_ids"])

    status = (
        db.session.query(BikeParkingStatus)
        .filter_by(internal_code=new_data["status_id"])
        .first()
    )
    if not status:
        abort(
            HTTPStatus.NOT_FOUND,
            message=f"Unable to find a status matching id {new_data['status_id']}.",
        )

    try:
        new_submission_status_update = SubmissionStatusUpdate(
            submissions=submissions,
            user_id=current_user.id,
            status_id=status.internal_code,
            comments=censored_comments,
        )
        db.session.add(new_submission_status_update)
        db.session.commit()
        return (
            {
                "status": "created",
                "submission_status_update_id": new_submission_status_update.id,
            },
            HTTPStatus.CREATED,
        )
    except IntegrityError:
        db.session.rollback()
        abort(HTTPStatus.INTERNAL_SERVER_ERROR)


# SUBMISSION COMMENT UPDATES
# --------------------------


class SubmissionCommentCreateConfirmationSchema(ma.Schema):
    status = ma.fields.Constant("created")
    submission_comment_id = ma.fields.Integer()
    # TODO should this confirmation also return the list of submission ids?


# TODO implement GET and PATCH routes


@statuses_blueprint.route("/comments", methods=["POST"])
@statuses_blueprint.arguments(SubmissionCommentSchema)
@statuses_blueprint.response(
    HTTPStatus.CREATED, SubmissionCommentCreateConfirmationSchema
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

    submissions = get_submissions_or_404(new_data["submission_ids"])

    # TODO make visibility privilege gated
    # should warn and reject if the user tries to set it to private and they don't have the right privileges
    # see: https://flask-security-too.readthedocs.io/en/stable/patterns.html#authentication-and-authorization

    try:
        new_submission_comment = SubmissionComment(
            submissions=submissions,
            user_id=current_user.id if current_user.is_authenticated else None,
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
        abort(HTTPStatus.INTERNAL_SERVER_ERROR)
