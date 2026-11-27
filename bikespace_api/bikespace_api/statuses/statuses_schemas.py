import marshmallow as ma

from bikespace_api.statuses.statuses_models import (
    ModerationStatus,
    StatusName,
    VisibilityStatus,
)


class UserSchema(ma.Schema):
    """Partial schema for User fields used by SubmissionUpdate handling"""

    id = ma.fields.Integer(dump_only=True)
    username = ma.fields.String(allow_none=True)


class SubmissionSchema(ma.Schema):
    """Partial schema for Submission fields used by SubmissionUpdate handling"""

    id = ma.fields.Integer(dump_only=True)


class SubmissionUpdateSchema(ma.Schema):
    id = ma.fields.Integer(dump_only=True)
    user = ma.fields.Pluck(UserSchema, "username", dump_only=True)
    comments = ma.fields.String(validate=ma.validate.Length(max=5000))
    # note: cannot load submission_ids using Pluck since "id" on SubmissionSchema is dump-only
    submission_ids = ma.fields.List(
        ma.fields.Integer(),
        load_only=True,
        required=True,
        validate=ma.validate.Length(min=1),
    )
    submissions = ma.fields.Pluck(
        SubmissionSchema,
        "id",
        many=True,
        dump_only=True,
        data_key="submission_ids",
    )
    effective_datetime = ma.fields.AwareDateTime(format="iso", required=True)
    submitted_datetime = ma.fields.AwareDateTime(format="iso", dump_only=True)
    moderation_status = ma.fields.Enum(
        ModerationStatus,
        by_value=True,
        dump_only=True,
    )


class BikeParkingStatusSchema(ma.Schema):
    id = ma.fields.Integer(dump_only=True)
    code = ma.fields.Enum(StatusName, by_value=True)
    label = ma.fields.String()
    internal_code = ma.fields.String()
    description = ma.fields.String()
    hide_by_default = ma.fields.Boolean()
    created_at = ma.fields.AwareDateTime(format="iso", dump_only=True)
    updated_at = ma.fields.AwareDateTime(format="iso", dump_only=True)


class SubmissionStatusUpdateSchema(SubmissionUpdateSchema):
    user = ma.fields.Pluck(UserSchema, "username", required=True, dump_only=True)
    status_id = ma.fields.Pluck(
        BikeParkingStatusSchema,
        "internal_code",
        load_only=True,
        required=True,
    )
    status = ma.fields.Nested(BikeParkingStatusSchema, dump_only=True)


class SubmissionCommentSchema(SubmissionUpdateSchema):
    comments = ma.fields.String(validate=ma.validate.Length(max=5000), required=True)
    visibility = ma.fields.Enum(VisibilityStatus, by_value=True, required=True)
