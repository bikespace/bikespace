# bikespace_api/bikespace_api/api/models.py

from sqlalchemy.sql import func
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from bikespace_api import db
from datetime import datetime
from enum import Enum

class IssueType(Enum):
    NOT_PROVIDED = "not_provided"
    FULL = "full"
    DAMAGED = "damaged"
    ABANDONDED = "abandoned"
    OTHER = "other"

class ParkingDuration(Enum):
    MINUTES = "minutes"
    HOURS = "hours"
    OVERNIGHT = "overnight"
    MULTIDAY = "multiday"

class Submission(db.Model):
    __tablename__ = "bikeparking_submissions"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    issues = db.Column(pg.ARRAY(sa.Enum(IssueType, create_constraint=False, native_enum=False)))
    parking_duration = db.Column(sa.Enum(ParkingDuration, create_constraint=False, native_enum=False))
    parking_time = db.Column(db.DateTime, nullable=False, default=datetime.now())
    comments = db.Column(db.String(256), default=None, nullable=True)

    def __init__(self, latitude, longitude, issues, parking_duration, parking_time, comments):
        self.latitude = latitude
        self.longitude = longitude
        self.issues = issues
        self.parking_duration = parking_duration
        self.parking_time = parking_time
        self.comments = comments

