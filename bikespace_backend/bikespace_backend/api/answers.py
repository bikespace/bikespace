# bikespace_backend/bikespace_backend/api/answers.py

from flask import Blueprint, jsonify

answers_blueprint = Blueprint('answers', __name__)

@answers_blueprint.route('/answers/ping', methods=['GET'])
def ping_pong():
    return jsonify({
        'status': 'success',
        'message': 'pong!'
    })