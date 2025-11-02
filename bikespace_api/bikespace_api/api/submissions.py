# bikespace_api/bikespace_api/api/submissions.py

import csv
import json
from io import StringIO

import geojson
import marshmallow as ma
from better_profanity import profanity
from flask import Response, make_response, request
from flask.views import MethodView
from flask_smorest import Blueprint, abort
from geojson import Feature, FeatureCollection, Point
from marshmallow import validate
from sqlalchemy import desc
from sqlalchemy.exc import IntegrityError

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
    submitted_datetime = ma.fields.AwareDateTime(format="iso", dump_only=True)


class SubmissionQueryArgsSchema(ma.Schema):
    limit = ma.fields.Integer()
    offset = ma.fields.Integer()


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
    @submissions_blueprint.response(200, SubmissionSchema(many=True))
    @submissions_blueprint.alt_response(
        200,
        schema=SubmissionSchema,  # placeholder
        content_type="application/geo+json",
        success=True,
    )
    @submissions_blueprint.alt_response(
        200,
        schema=SubmissionSchema,  # placeholder
        content_type="text/csv",
        success=True,
    )
    def get(self, args):
        """Returns user reports of bicycle parking problems"""
        accept_header = request.headers.get("Accept")
        if accept_header == "application/json":
            return get_submissions_json(args)
        elif accept_header == "application/geo+json":
            return get_submissions_geo_json()
        elif accept_header == "text/csv":
            return get_submissions_csv()
        else:
            return get_submissions_json(args)

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


@submissions_blueprint.route("/submissions/<submission_id>", methods=["GET"])
@submissions_blueprint.response(200, SubmissionSchema)
def get_submission_with_id(submission_id):
    query_result = Submission.query.filter_by(id=submission_id).first()
    if query_result is not None:
        return query_result
    else:
        abort(404, message="Item not found")


def get_submissions_json(args) -> Response:
    """Default response for GET /submissions. Returns user reports from the bikeparking_submissions table in a paginated JSON format."""
    offset = args.get("offset", 1)
    limit = args.get("limit", DEFAULT_OFFSET_LIMIT)

    pagination = Submission.query.order_by(desc(Submission.parking_time)).paginate(  # type: ignore
        page=offset, per_page=limit, count=True
    )
    submissions = pagination.items

    json_output = []

    for submission in submissions:
        issues = []
        for issue in submission.issues:
            issues.append(issue.value)
        submission_json = {
            "id": submission.id,
            "latitude": submission.latitude,
            "longitude": submission.longitude,
            "issues": issues,
            "parking_duration": submission.parking_duration.value,
            "parking_time": submission.parking_time,
            "comments": submission.comments,
            "submitted_datetime": (
                submission.submitted_datetime.isoformat()
                if submission.submitted_datetime is not None
                else None
            ),
        }
        json_output.append(submission_json)

    final_response = {
        "submissions": json_output,
        "pagination": {
            "current_page": pagination.page,
            "total_items": pagination.total,
            "total_pages": pagination.pages,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev,
        },
    }

    return_response = Response(
        response=json.dumps(final_response, default=str),
        status=200,
        mimetype="application/json",
    )
    return return_response


def get_submissions_geo_json() -> Response:
    """Optional response for GET /submissions. Returns user reports from the bikeparking_submissions table in GeoJSON format without pagination."""
    submissions = Submission.query.all()
    geojson_features = []
    for submission in submissions:
        issues = []
        for issue in submission.issues:
            issues.append(issue.value)
        point_feature = Feature(
            geometry=Point((submission.longitude, submission.latitude)),
            properties={
                "id": submission.id,
                "comments": submission.comments,
                "issues": issues,
                "parking_duration": submission.parking_duration.value,
                "parking_time": str(submission.parking_time),
                "submitted_datetime": (
                    submission.submitted_datetime.isoformat()
                    if submission.submitted_datetime is not None
                    else None
                ),
            },
        )
        if point_feature.is_valid:
            geojson_features.append(point_feature)

    feature_collection = FeatureCollection(geojson_features)
    feature_collection.errors()
    return_response = Response(
        geojson.dumps(feature_collection), 200, mimetype="application/geo+json"
    )
    return return_response


def get_submissions_csv() -> Response:
    """Optional response for GET /submissions. Returns user reports from the bikeparking_submissions table in CSV format. Also breaks out issue types into separate columns for easier analysis."""
    submissions = Submission.query.order_by(desc(Submission.parking_time)).all()  # type: ignore
    submissions_list = []
    for submission in submissions:
        row = []
        row.append(submission.id)
        row.append(submission.latitude)
        row.append(submission.longitude)
        row.append(str(submission.parking_time))
        row.append(";".join([issue.value for issue in submission.issues]))
        for issue_type in IssueType:
            row.append(issue_type in submission.issues)
        row.append(submission.parking_duration.value)
        row.append(submission.comments)
        row.append(
            submission.submitted_datetime.isoformat()
            if submission.submitted_datetime is not None
            else None
        )
        submissions_list.append(row)

    string_io = StringIO()
    csv_writer = csv.writer(string_io)
    csv_headers = [
        "id",
        "latitude",
        "longitude",
        "parking_time",
        "issues",
        *["issue_" + t.value for t in IssueType],
        "parking_duration",
        "comments",
        "submitted_datetime",
    ]
    csv_writer.writerow(csv_headers)
    csv_writer.writerows(submissions_list)
    return_response = make_response(string_io.getvalue())
    return_response.headers["Content-Disposition"] = (
        "attachment; filename=submissions.csv"
    )
    return_response.headers["Content-Type"] = "text/csv"
    return return_response
