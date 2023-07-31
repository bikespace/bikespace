# bikespace_api/bikespace_api/api/models.py

from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSON
from bikespace_api import db
from datetime import datetime


class Submission(db.Model):
    __tablename__ = "bikeparking_submissions"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    issues = db.Column(db.String(256), nullable=False, default="not_provided")
    parking_duration = db.Column(db.String(128), nullable=False, default="minutes")
    parking_time = db.Column(db.DateTime, nullable=False, default=datetime.now())
    comments = db.Column(db.String(256), default=None, nullable=True)

    def __init__(self, latitude, longitude, issues, parking_duration, parking_time, comments):
        self.latitude = latitude
        self.longitude = longitude
        self.issues = issues
        self.parking_duration = parking_duration
        self.parking_time = parking_time
        self.comments = comments
