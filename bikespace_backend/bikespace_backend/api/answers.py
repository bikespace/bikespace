# bikespace_backend/bikespace_backend/api/answers.py

from flask import Blueprint, jsonify
from bikespace_backend.api.models import SurveyAnswer
import json

answers_blueprint = Blueprint("answers", __name__)


@answers_blueprint.route("/answers/ping", methods=["GET"])
def ping_pong():
    return jsonify({"status": "success", "message": "pong!"})

@answers_blueprint.route("/answers", methods=["GET"])
def get_answers():
    survey_answers = SurveyAnswer.query.all()
    json_output = []
    for survey_answer in survey_answers:
        survey_answer_json = {
            'id': survey_answer.id,
            'latitude': survey_answer.latitude,
            'longitude': survey_answer.longitude,
            'survey': json.loads(survey_answer.survey),
            'comments': survey_answer.comments
        }
        json_output.append(survey_answer_json)
    return jsonify(json_output)