# bikespace_api/bikespace_api/api/answers.py

from flask import Blueprint, jsonify, request
from bikespace_api.api.models import Submission
from bikespace_api import db
from sqlalchemy.exc import IntegrityError
import json

submissions_blueprint = Blueprint("submissions", __name__)


@submissions_blueprint.route("/submissions", methods=["GET", "POST"])
def get_answers():
    if request.method == "GET":
        submissions = Submission.query.all()
        json_output = []
        for submission in submissions:
            submission_json = {
                "id": submission.id,
                "latitude": submission.latitude,
                "longitude": submission.longitude,
                "survey": json.loads(submission.survey),
                "comments": submission.comments,
            }
            json_output.append(submission_json)
        return jsonify(json_output)
    elif request.method == "POST":
        print(type(request.json))
        json_body = request.json
        try:
            new_survey_answer = Submission(
                json_body["latitude"],
                json_body["longitude"],
                json.dumps(json_body["survey"]),
                json_body["comments"],
            )
            db.session.add(new_survey_answer)
            db.session.commit()
            return jsonify({"status": "created"}), 201
        except IntegrityError:
            db.session.rollback()
            return jsonify({"status": "Error"})


@submissions_blueprint.route("/submissions/<submission_id>", methods=["GET"])
def get_submission_with_id(submission_id):
    submission_with_id = Submission.query.filter_by(id=submission_id).first()
    submission_with_id_json = {
        "id": submission_with_id.id,
        "latitude": submission_with_id.latitude,
        "longitude": submission_with_id.longitude,
        "survey": json.loads(submission_with_id.survey),
        "comments": submission_with_id.comments,
    }
    return jsonify(submission_with_id_json)
