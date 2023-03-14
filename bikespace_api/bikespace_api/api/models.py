# bikespace_api/bikespace_api/api/models.py

from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSON
from bikespace_api import db


class Submission(db.Model):
    __tablename__ = "bikeparking_submissions"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    survey = db.Column(JSON, nullable=False)
    comments = db.Column(db.String(256), default=None, nullable=True)

    def __init__(self, latitude, longitude, survey, comments):
        self.latitude = latitude
        self.longitude = longitude
        self.survey = survey
        self.comments = comments
