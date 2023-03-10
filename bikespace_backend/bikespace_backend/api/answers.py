# bikespace_backend/bikespace_backend/api/answers.py

from flask import Blueprint, jsonify, request
from bikespace_backend.api.models import SurveyAnswer
from bikespace_backend import db
from sqlalchemy.exc import IntegrityError
import json

answers_blueprint = Blueprint("answers", __name__)


@answers_blueprint.route("/answers", methods=["GET", "POST"])
def get_answers():
    if request.method == "GET":
        survey_answers = SurveyAnswer.query.all()
        json_output = []
        for survey_answer in survey_answers:
            survey_answer_json = {
                "id": survey_answer.id,
                "latitude": survey_answer.latitude,
                "longitude": survey_answer.longitude,
                "survey": json.loads(survey_answer.survey),
                "comments": survey_answer.comments,
            }
            json_output.append(survey_answer_json)
        return jsonify(json_output)
    elif request.method == "POST":
        print(type(request.json))
        json_body = request.json
        try:
            new_survey_answer = SurveyAnswer(
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


@answers_blueprint.route("/answers/<answer_id>", methods=["GET"])
def get_answers_id(answer_id):
    survey_answer_with_id = SurveyAnswer.query.filter_by(id=answer_id).first()
    survey_answer_with_id_json = {
        "id": survey_answer_with_id.id,
        "latitude": survey_answer_with_id.latitude,
        "longitude": survey_answer_with_id.longitude,
        "survey": json.loads(survey_answer_with_id.survey),
        "comments": survey_answer_with_id.comments,
    }
    return jsonify(survey_answer_with_id_json)
