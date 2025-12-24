from datetime import datetime, timezone
from enum import Enum
from typing import Optional

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
import sqlalchemy.orm as so
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


submission_and_status_update_association = sa.Table(
    "submission_and_status_update_association",
    db.metadata,
    sa.Column("submission_id", sa.ForeignKey("bikeparking_submissions.id")),
    sa.Column("status_update_id", sa.ForeignKey("bikeparking_status_updates.id")),
)

submission_and_submission_comment_association = sa.Table(
    "submission_and_submission_comment_association",
    db.metadata,
    sa.Column("submission_id", sa.ForeignKey("bikeparking_submissions.id")),
    sa.Column("submission_comment_id", sa.ForeignKey("bikeparking_comments.id")),
)


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
    status_updates: so.Mapped[list["StatusUpdate"]] = so.relationship(
        secondary=submission_and_status_update_association,
        back_populates="submissions",
    )
    submission_comments: so.Mapped[list["SubmissionComment"]] = so.relationship(
        secondary=submission_and_submission_comment_association,
        back_populates="submissions",
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

    def __repr__(self):
        return f"<Submission {self.id}>"


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
    status_updates: so.WriteOnlyMapped["StatusUpdate"] = so.relationship(
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
    # submission_id: so.Mapped[int] = so.mapped_column(
    #     sa.ForeignKey(Submission.id), index=True
    # )
    submissions: so.Mapped[list["Submission"]] = so.relationship(
        secondary=submission_and_status_update_association,
        back_populates="status_updates",
    )
    # comment_id: so.Mapped[int] = so.mapped_column(
    #     sa.ForeignKey("bikeparking_comments.id"), index=True
    # )
    comment: so.Mapped["SubmissionComment"] = so.relationship(
        back_populates="status_update"
    )
    user_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey("user.id"), index=True)
    user: so.Mapped["User"] = so.relationship(back_populates="status_updates")
    status_id: so.Mapped[str] = so.mapped_column(
        sa.ForeignKey("bikeparking_statuses.id"), index=True
    )
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

    def __repr__(self):
        return f"<StatusUpdate {self.id} for Submission {self.status_id}>"


class SubmissionComment(db.Model):
    __tablename__ = "bikeparking_comments"
    __versioned__ = {}  # generate version history log with sqlalchemy-continuum

    id: so.Mapped[int] = so.mapped_column(primary_key=True, autoincrement=True)
    # submission_id: so.Mapped[int] = so.mapped_column(
    #     sa.ForeignKey("bikeparking_submissions.id")
    # )
    submissions: so.Mapped[list["Submission"]] = so.relationship(
        secondary=submission_and_submission_comment_association,
        back_populates="submission_comments",
    )
    status_update_id: so.Mapped[Optional[int]] = so.mapped_column(
        sa.ForeignKey("bikeparking_status_updates.id"), index=True
    )
    status_update: so.Mapped[Optional[StatusUpdate]] = so.relationship(
        back_populates="comment",
        foreign_keys=[status_update_id],
    )
    user_id: so.Mapped[Optional[int]] = so.mapped_column(
        sa.ForeignKey("user.id"), index=True
    )
    user: so.Mapped[Optional["User"]] = so.relationship(
        back_populates="submission_comments"
    )
    comments: so.Mapped[str]
    submitted_datetime: so.Mapped[datetime] = so.mapped_column(
        sa.DateTime(timezone=True)
    )
    moderation_status: so.Mapped[ModerationStatus] = so.mapped_column(
        sa.Enum(ModerationStatus, native_enum=False), nullable=True
    )

    def __repr__(self):
        return f"<SubmissionComment {self.id} for Submission {self.submission_id}>"
