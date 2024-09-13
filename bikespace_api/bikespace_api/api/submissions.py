# bikespace_api/bikespace_api/api/answers.py

from flask import Blueprint, jsonify, request, Response
from bikespace_api.api.models import Submission, IssueType, ParkingDuration
from bikespace_api import db
from sqlalchemy.exc import IntegrityError
from sqlalchemy import desc
import json
from better_profanity import profanity
import geojson
from geojson import Feature, FeatureCollection, Point

submissions_blueprint = Blueprint("submissions", __name__)

DEFAULT_OFFSET_LIMIT = 100


@submissions_blueprint.route("/submissions", methods=["GET", "POST"])
def handle_submissions():
    if request.method == "GET":
        accept_header = request.headers.get("Accept")
        if (accept_header == "application/json"):
            return get_submissions_json(request)
        elif (accept_header == "application/geo+json"):
            return get_submissions_geo_json(request)
        else:
            return get_submissions_json(request)
    elif request.method == "POST":
        return post_submissions(request)


@submissions_blueprint.route("/submissions/<submission_id>", methods=["GET"])
def get_submission_with_id(submission_id):
    submission_with_id = Submission.query.filter_by(id=submission_id).first()
    issues = []
    for issue in submission_with_id.issues:
        issues.append(issue.value)
    submission_with_id_json = {
        "id": submission_with_id.id,
        "latitude": submission_with_id.latitude,
        "longitude": submission_with_id.longitude,
        "issues": issues,
        "parking_duration": submission_with_id.parking_duration.value,
        "parking_time": submission_with_id.parking_time,
        "comments": submission_with_id.comments,
    }
    return_response = Response(response=json.dumps(submission_with_id_json, default=str), status=200, mimetype="application/json")
    return return_response

def get_submissions_json(request):
    offset = request.args.get("offset", 1, type=int)
    limit = request.args.get("limit", DEFAULT_OFFSET_LIMIT, type=int)

    pagination = Submission.query.order_by(desc(Submission.parking_time)).paginate(
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

    return_response = Response(response=json.dumps(final_response, default=str), status=200, mimetype="application/json")
    return return_response


def post_submissions(request):
    json_body = request.json
    issues = []
    profanity.load_censor_words()
    censored_comments = profanity.censor(json_body["comments"])
    for issue in json_body["issues"]:
        issues.append(IssueType(issue))
    try:
        new_submission = Submission(
            json_body["latitude"],
            json_body["longitude"],
            issues,
            ParkingDuration(json_body["parking_duration"]),
            json_body["parking_time"],
            censored_comments,
        )
        db.session.add(new_submission)
        db.session.commit()
        return_response = Response(json.dumps({"status": "created"}), 201)
        return return_response
    except IntegrityError:
        db.session.rollback()
        return_response = Response(json.dumps({"status": "Error"}), 500)
        return 

def get_submissions_geo_json(request):
    submissions = Submission.query.all()
    geojson_features = []
    for submission in submissions:
        issues = []
        for issue in submission.issues:
            issues.append(issue.value)
        point_feature = Feature(
            geometry=Point((submission.longitude, submission.latitude)),
            properties={
                "id" : submission.id,
                "comments" : submission.comments,
                "issues" : issues,
                "parking_duration" : submission.parking_duration.value,
                "parking_time" : str(submission.parking_time),
            },
        )
        if (point_feature.is_valid):
            geojson_features.append(point_feature)
    
    feature_collection = FeatureCollection(geojson_features)
    feature_collection.errors()
    return_response = Response(geojson.dumps(feature_collection), 200, mimetype="application/geo+json")
    return return_response
    