# bikespace_api/bikespace_api/api/submissions.py

import csv
import json
from enum import Enum
from io import StringIO

import marshmallow as ma
from better_profanity import profanity
from flask import Response, make_response, request, url_for
from flask.views import MethodView
from flask_smorest import Blueprint, abort
from geojson import Feature, FeatureCollection, Point
from marshmallow import validate
from sqlalchemy import desc
from sqlalchemy.exc import IntegrityError
from sqlalchemy_continuum import count_versions, version_class

from bikespace_api import db  # type: ignore
from bikespace_api.api.models import IssueType, ParkingDuration, Submission

submissions_blueprint = Blueprint(
    "submissions",
    __name__,
    url_prefix="/api/v2",
    description="User reports of bicycle parking problems",
)

DEFAULT_OFFSET_LIMIT = 100


class SubmissionSchema(ma.Schema):
    id = ma.fields.Integer(dump_only=True)
    latitude = ma.fields.Float(required=True)
    longitude = ma.fields.Float(required=True)
    issues = ma.fields.List(ma.fields.Enum(IssueType, by_value=True))
    parking_duration = ma.fields.Enum(ParkingDuration, by_value=True)
    parking_time = ma.fields.DateTime(format="iso", required=True)
    comments = ma.fields.String()
    submitted_datetime = ma.fields.AwareDateTime(
        format="iso", dump_only=True, allow_none=True
    )


class SubmissionSchemaWithVersion(SubmissionSchema):
    version = ma.fields.Integer(dump_only=True, validate=validate.Range(min=1))
    version_history_url = ma.fields.Url(dump_only=True)


class SubmissionQueryArgsSchema(ma.Schema):
    limit = ma.fields.Integer()
    offset = ma.fields.Integer()


class PaginationSchema(ma.Schema):
    current_page = ma.fields.Integer(attribute="page")
    total_items = ma.fields.Integer(attribute="total")
    total_pages = ma.fields.Integer(attribute="pages")
    has_next = ma.fields.Boolean()
    has_prev = ma.fields.Boolean()


class PaginatedSubmissionsSchema(ma.Schema):
    submissions = ma.fields.Nested(SubmissionSchemaWithVersion(many=True))
    pagination = ma.fields.Nested(PaginationSchema)


class GeometryPointSchema(ma.Schema):
    type = ma.fields.Constant("Point")
    coordinates = ma.fields.List(ma.fields.Float(), validate=validate.Length(equal=2))


class SubmissionSchemaWithVersionNoGeometry(SubmissionSchemaWithVersion):
    class Meta:
        exclude = ["latitude", "longitude"]


class SubmissionGeoJSONFeatureSchema(ma.Schema):
    type = ma.fields.Constant("Feature")
    geometry = ma.fields.Nested(GeometryPointSchema)
    properties = ma.fields.Nested(SubmissionSchemaWithVersionNoGeometry)


class GeoJSONSubmissionsSchema(ma.Schema):
    type = ma.fields.Constant("FeatureCollection")
    features = ma.fields.Nested(SubmissionGeoJSONFeatureSchema(many=True))


SubmissionCSVSchema = ma.Schema.from_dict(
    SubmissionSchemaWithVersion._declared_fields
    | {f"issue_{issue.value}": ma.fields.Boolean() for issue in IssueType},
    name="SubmissionCSVSchema",
)


class SubmissionCreateSchema(SubmissionSchema):
    class Meta(ma.SchemaOpts):
        only = [
            "latitude",
            "longitude",
            "issues",
            "parking_duration",
            "parking_time",
            "comments",
        ]


class SubmissionCreateConfirmationSchema(ma.Schema):
    status = ma.fields.String(validate=validate.OneOf(["created", "Error"]))
    submission_id = ma.fields.Integer()


@submissions_blueprint.route("/submissions")
class Submissions(MethodView):
    """Main functions for reading and creating user reports of bicycle parking problems"""

    @submissions_blueprint.arguments(
        SubmissionQueryArgsSchema,
        location="query",
    )
    @submissions_blueprint.response(200, PaginatedSubmissionsSchema)
    @submissions_blueprint.alt_response(
        200,
        schema=GeoJSONSubmissionsSchema,
        content_type="application/geo+json",
        success=True,
    )
    @submissions_blueprint.alt_response(
        200,
        schema=SubmissionCSVSchema(many=True),
        content_type="text/csv",
        success=True,
    )
    def get(self, args):
        """Returns user reports of bicycle parking problems"""
        accept_header = request.headers.get("Accept")
        if accept_header == "application/geo+json":
            return get_submissions_geo_json()
        elif accept_header == "text/csv":
            return get_submissions_csv()
        else:
            offset = args.get("offset", 1)
            limit = args.get("limit", DEFAULT_OFFSET_LIMIT)
            pagination = Submission.query.order_by(
                desc(Submission.parking_time)  # type: ignore
            ).paginate(page=offset, per_page=limit, count=True)

            submissions = pagination.items
            for submission in submissions:
                submission.version = count_versions(submission)
                submission.version_history_url = url_for(
                    "submissions.get_submission_history_with_id",
                    submission_id=submission.id,
                    _external=True,
                )

            return {
                "submissions": submissions,
                "pagination": pagination,
            }

    @submissions_blueprint.arguments(SubmissionCreateSchema)
    @submissions_blueprint.response(201, SubmissionCreateConfirmationSchema)
    def post(self, new_data):
        """Create a new submission"""
        profanity.load_censor_words()
        censored_comments = profanity.censor(new_data["comments"])
        try:
            new_submission = Submission(
                new_data["latitude"],
                new_data["longitude"],
                new_data["issues"],
                new_data["parking_duration"],
                new_data["parking_time"],
                censored_comments,
            )
            db.session.add(new_submission)
            db.session.commit()
            return_response = Response(
                json.dumps({"status": "created", "submission_id": new_submission.id}),
                201,
            )
            return return_response
        except IntegrityError:
            db.session.rollback()
            return_response = Response(json.dumps({"status": "Error"}), 500)
            return


def get_submissions_geo_json() -> Response:
    """Optional response for GET /submissions. Returns user reports from the bikeparking_submissions table in GeoJSON format without pagination."""
    submissions = Submission.query.all()

    for submission in submissions:
        submission.version = count_versions(submission)
        submission.version_history_url = url_for(
            "submissions.get_submission_history_with_id",
            submission_id=submission.id,
            _external=True,
        )

    submission_features = [
        Feature(
            geometry=Point((submission.longitude, submission.latitude)),
            properties=submission,
        )
        for submission in submissions
    ]
    feature_collection = FeatureCollection(submission_features)

    # validate with geojson
    feature_collection.errors()

    return_response = Response(
        GeoJSONSubmissionsSchema().dumps(feature_collection),
        200,
        mimetype="application/geo+json",
    )
    return return_response


def get_submissions_csv() -> Response:
    """Optional response for GET /submissions. Returns user reports from the bikeparking_submissions table in CSV format. Also breaks out issue types into separate columns for easier analysis."""
    submissions = Submission.query.order_by(desc(Submission.parking_time)).all()  # type: ignore

    for submission in submissions:
        submission.version = count_versions(submission)
        submission.version_history_url = url_for(
            "submissions.get_submission_history_with_id",
            submission_id=submission.id,
            _external=True,
        )
        for issue in IssueType:
            setattr(submission, f"issue_{issue.value}", issue in submission.issues)

    string_io = StringIO()
    writer = csv.DictWriter(
        string_io, fieldnames=SubmissionCSVSchema._declared_fields.keys()
    )
    writer.writeheader()
    writer.writerows(SubmissionCSVSchema(many=True).dump(submissions))  # type: ignore

    return_response = make_response(string_io.getvalue())
    return_response.status = 200
    return_response.mimetype = "text/csv"
    return_response.headers["Content-Disposition"] = (
        "attachment; filename=submissions.csv"
    )
    return return_response


@submissions_blueprint.route("/submissions/<submission_id>", methods=["GET"])
@submissions_blueprint.response(200, SubmissionSchemaWithVersion)
def get_submission_with_id(submission_id):
    """Return a single submission using its id"""
    query_result = Submission.query.filter_by(id=submission_id).first()
    if query_result is not None:
        query_result.version = count_versions(query_result)
        query_result.version_history_url = url_for(
            "submissions.get_submission_history_with_id",
            submission_id=submission_id,
            _external=True,
        )
        return query_result
    else:
        abort(404, message="Item not found")


def get_changeset_fields(schema: type[ma.Schema]) -> type[ma.Schema]:
    """
    Returns a SQLAlchemy-Continuum "changeset" version of a marshmallow Schema. Transforms each field into a two-item list where the value can be the original field time or None.

    The format of changeset values is generally a two-item list with the previous and current value of a property:

    ```python
    # create:
    {"key": [None, 1]}

    # update:
    {"key": [1, 2]}
    ```

    The schema transformation is equivalent to:

    ```python
    # original
    class ExampleSchema(Schema):
        key = fields.Integer()

    # changeset version
    class ExampleChangesetSchema(Schema):
        key = fields.List(
            fields.Integer(allow_none=True),
            validate=validate.Length(equal=2),
        )
    ```
    """
    parent_fields = schema._declared_fields
    for field in parent_fields.values():
        field.allow_none = True
    changeset_fields = {
        k: ma.fields.List(v, validate=validate.Length(equal=2))
        for k, v in parent_fields.items()
    }
    return ma.Schema.from_dict(changeset_fields, name="SubmissionChangesetSchema")  # type: ignore


class OperationType(Enum):
    CREATE = 0
    UPDATE = 1
    DELETE = 2


class SubmissionHistorySchema(ma.Schema):
    version_index = ma.fields.Integer(attribute="index")
    operation_description = ma.fields.Enum(OperationType)
    transaction_user = ma.fields.Integer(
        validate=validate.Range(min=1),
        allow_none=True,
        attribute="transaction.user_id",
    )
    issued_at = ma.fields.NaiveDateTime(format="iso", attribute="transaction.issued_at")
    changes = ma.fields.Nested(
        get_changeset_fields(SubmissionSchema), attribute="changeset"
    )


@submissions_blueprint.route("/submissions/<submission_id>/history", methods=["GET"])
@submissions_blueprint.response(200, SubmissionHistorySchema(many=True))
def get_submission_history_with_id(submission_id):
    """Return the history of changes for a submission

    Changed or created values are listed under "changes" with a list for each value containing the original and updated values. The original value for create operations is None."""
    SubmissionVersion = version_class(Submission)
    submission_versions_with_id = SubmissionVersion.query.filter_by(
        id=submission_id
    ).order_by(SubmissionVersion.transaction_id)

    output_versions = submission_versions_with_id.all()
    for submission in output_versions:
        submission.operation_description = OperationType(submission.operation_type)

    return output_versions
