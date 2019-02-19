# bikespace_backend/bikespace_backend/api/models.py

from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSON
from bikespace_backend import db

class SurveyAnswer(db.Model):

    __tablename__ = 'bikeparking_surveyanswer'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    survey = db.Column(JSON, nullable=False)
    comments = db.Column(db.String(256), default=None)

    def __init__(self, latitude, longitude, survey):
        self.latitude = latitude
        self.longitude = longitude