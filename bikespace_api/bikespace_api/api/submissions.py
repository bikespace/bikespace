# bikespace_api/bikespace_api/api/answers.py

from flask import Blueprint, jsonify, request
from bikespace_api.api.models import Submission, IssueType, ParkingDuration
from bikespace_api import db
from sqlalchemy.exc import IntegrityError
from sqlalchemy import desc
import json
from better_profanity import profanity

submissions_blueprint = Blueprint("submissions", __name__)

DEFAULT_OFFSET_LIMIT = 100 

@submissions_blueprint.route("/submissions", methods=["GET", "POST"])
def handle_submissions():
    if request.method == "GET":
        return get_submissions(request)
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
    return jsonify(submission_with_id_json)


def get_submissions(request):
    offset = request.args.get('offset', 1, type=int) 
    limit = request.args.get('limit', DEFAULT_OFFSET_LIMIT, type=int) 

    submissions = Submission.query.order_by(desc(Submission.parking_time)).paginate(offset, limit, False).items 

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
    return jsonify(json_output)


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
        return jsonify({"status": "created"}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"status": "Error"})
