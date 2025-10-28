# bikespace_api/bikespace_api/api/models.py

from sqlalchemy.sql import func
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from bikespace_api import db
from datetime import datetime, timezone
from enum import Enum
from flask_security import RoleMixin, UserMixin
from werkzeug.security import generate_password_hash, check_password_hash


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

    def __init__(
        self, latitude, longitude, issues, parking_duration, parking_time, comments
    ):
        self.latitude = latitude
        self.longitude = longitude
        self.issues = issues
        self.parking_duration = parking_duration
        self.parking_time = parking_time
        self.comments = comments
        self.submitted_datetime = datetime.now(timezone.utc)


roles_users = db.Table(
    "roles_users",
    db.Column("user_id", db.Integer(), db.ForeignKey("user.id")),
    db.Column("role_id", db.Integer(), db.ForeignKey("role.id")),
)


class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

    def __str__(self):
        return self.name


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(255))
    last_name = db.Column(db.String(255))
    email = db.Column(db.String(255), unique=True)
    password = db.Column(db.String(255))
    active = db.Column(db.Boolean())
    confirmed_at = db.Column(db.DateTime())
    roles = db.relationship(
        "Role", secondary=roles_users, backref=db.backref("users", lazy="dynamic")
    )
    fs_uniquifier = db.Column(db.String(64), unique=True, nullable=False)

    def __str__(self):
        return self.email
