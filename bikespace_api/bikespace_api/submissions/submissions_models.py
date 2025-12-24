from datetime import datetime, timezone
from enum import Enum

import sqlalchemy as sa
import sqlalchemy.orm as so
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
    status_updates: so.WriteOnlyMapped[list["StatusUpdate"]] = so.relationship(
        back_populates="submission"
    )

    # __init__ params need to have a default value for revert from deleted state to work with sqlalchemy-continuum
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


class StatusType(Enum):
    ACTION_REQUIRED = "action_required"
    RESOLUTION_PENDING = "resolution_pending"
    RESOLVED_SUCCESS = "resolved_success"
    RESOLVED_INFORMATIONAL = "resolved_informational"
    CLOSED_UNRESOLVED = "closed_unresolved"
    INVALID_SUBMISSION = "invalid_submission"

    def __str__(self):
        return self.name


class Status(db.Model):
    __tablename__ = "bikeparking_statuses"
    __versioned__ = {}  # generate version history log with sqlalchemy-continuum

    id: so.Mapped[str] = so.mapped_column(sa.String(length=256), primary_key=True)
    status_type: so.Mapped[StatusType] = so.mapped_column(
        sa.Enum(StatusType, native_enum=False)
    )
    status_description: so.Mapped[str]
    status_information: so.Mapped[str]
    hide_by_default: so.Mapped[bool]
    status_updates: so.WriteOnlyMapped[list["StatusUpdate"]] = so.relationship(
        back_populates="status"
    )

    def __repr__(self):
        return f"<Status {self.id} ({self.status_description})>"


class ModerationStatus(Enum):
    """
    Intended usage:
    - flagged: needs to be reviewed, still viewable
    - hidden: investigation or decision pending, not viewable
    - blocked: found not to comply with community standards, not viewable
    """

    FLAGGED = "flagged"
    HIDDEN = "hidden"
    BLOCKED = "blocked"


class StatusUpdate(db.Model):
    __tablename__ = "bikeparking_status_updates"
    __versioned__ = {}  # generate version history log with sqlalchemy-continuum

    id: so.Mapped[int] = so.mapped_column(primary_key=True, autoincrement=True)
    submission_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey(Submission.id), index=True
    )
    submission: so.Mapped["Submission"] = so.relationship(
        back_populates="status_updates"
    )
    # comment_id
    user_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey("user.id"), index=True)
    user: so.Mapped["User"] = so.relationship(back_populates="status_updates")
    status_id: so.Mapped[str] = so.mapped_column(sa.ForeignKey(Status.id), index=True)
    status: so.Mapped["Status"] = so.relationship(back_populates="status_updates")
    effective_datetime: so.Mapped[datetime] = so.mapped_column(
        sa.DateTime(timezone=True)
    )
    submitted_datetime: so.Mapped[datetime] = so.mapped_column(
        sa.DateTime(timezone=True)
    )
    moderation_status: so.Mapped[ModerationStatus] = so.mapped_column(
        sa.Enum(ModerationStatus, native_enum=False), nullable=True
    )
