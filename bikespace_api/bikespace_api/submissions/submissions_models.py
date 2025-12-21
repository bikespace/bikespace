from datetime import datetime, timezone
from enum import Enum

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from sqlalchemy_continuum import make_versioned
from sqlalchemy_continuum.plugins import FlaskPlugin

from bikespace_api import db  # type: ignore

make_versioned(plugins=[FlaskPlugin()])


class IssueType(Enum):
    NOT_PROVIDED = "not_provided"
    FULL = "full"
    DAMAGED = "damaged"
    ABANDONDED = "abandoned"
    OTHER = "other"

    def __str__(self):
        return self.name


class ParkingDuration(Enum):
    MINUTES = "minutes"
    HOURS = "hours"
    OVERNIGHT = "overnight"
    MULTIDAY = "multiday"

    def __str__(self):
        return self.name


class Submission(db.Model):
    __tablename__ = "bikeparking_submissions"
    __versioned__ = {}  # generate version history log with sqlalchemy-continuum

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    issues = db.Column(
        pg.ARRAY(sa.Enum(IssueType, create_constraint=False, native_enum=False))
    )
    parking_duration = db.Column(
        sa.Enum(ParkingDuration, create_constraint=False, native_enum=False)
    )
    parking_time = db.Column(db.DateTime, nullable=False, default=datetime.now())
    comments = db.Column(db.Text, default=None, nullable=True)
    submitted_datetime = db.Column(db.DateTime(timezone=True), nullable=True)

    # __init__ params need to have a default value for revert from deleted state to work with sqlalchemy_continuum
    def __init__(
        self,
        latitude=None,
        longitude=None,
        issues=None,
        parking_duration=None,
        parking_time=None,
        comments=None,
    ):
        self.latitude = latitude
        self.longitude = longitude
        self.issues = issues
        self.parking_duration = parking_duration
        self.parking_time = parking_time
        self.comments = comments
        self.submitted_datetime = datetime.now(timezone.utc)
