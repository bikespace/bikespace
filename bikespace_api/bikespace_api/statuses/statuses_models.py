from datetime import UTC, datetime
from enum import Enum

import sqlalchemy as sa
import sqlalchemy.orm as so

from bikespace_api import db  # type: ignore


class StatusName(Enum):
    ACTION_REQUIRED = "action_required"
    RESOLUTION_PENDING = "resolution_pending"
    RESOLVED_SUCCESS = "resolved_success"
    RESOLVED_INFORMATIONAL = "resolved_informational"
    CLOSED_UNRESOLVED = "closed_unresolved"
    INVALID_SUBMISSION = "invalid_submission"

    def __str__(self):
        return self.name


class ModerationStatus(Enum):
    FLAGGED = "flagged"
    BLOCKED = "blocked"

    def __str__(self):
        return self.name


class VisibilityStatus(Enum):
    PUBLIC = "public"
    PRIVATE = "private"

    def __str__(self):
        return self.name


class BikeParkingStatus(db.Model):
    __tablename__ = "bikeparking_statuses"
    __versioned__ = {}

    id: so.Mapped[int] = so.mapped_column(primary_key=True, autoincrement=True)
    code: so.Mapped[StatusName] = so.mapped_column(
        sa.Enum(StatusName, create_constraint=False, native_enum=False),
        nullable=False,
    )
    label: so.Mapped[str] = so.mapped_column(sa.String, nullable=False)
    internal_code: so.Mapped[str] = so.mapped_column(
        sa.String, nullable=False, unique=True
    )
    description: so.Mapped[str] = so.mapped_column(sa.Text, nullable=False)
    hide_by_default: so.Mapped[bool] = so.mapped_column(
        sa.Boolean, nullable=False, default=False
    )
    created_at: so.Mapped[datetime] = so.mapped_column(
        sa.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),  # pragma: no cover
    )
    updated_at: so.Mapped[datetime] = so.mapped_column(
        sa.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),  # pragma: no cover
        onupdate=lambda: datetime.now(UTC),  # pragma: no cover
    )

    def __init__(
        self,
        code: StatusName = None,  # type: ignore
        label: str = None,  # type: ignore
        internal_code: str = None,  # type: ignore
        description: str = None,  # type: ignore
        hide_by_default: bool = False,
    ):
        self.code = code
        self.label = label
        self.internal_code = internal_code
        self.description = description
        self.hide_by_default = hide_by_default
        self.created_at = datetime.now(UTC)
        self.updated_at = datetime.now(UTC)


class SubmissionUpdate(db.Model):
    """Shared base model for SubmissionComment and SubmissionStatusUpdate"""

    id: so.Mapped[int] = so.mapped_column(primary_key=True, autoincrement=True)
    # todo check how to make this a fk list?
    submission_ids: so.Mapped[list[int]] = so.mapped_column(
        sa.ForeignKey("bikeparking_submissions.id"), index=True
    )
    user_id: so.Mapped[int | None] = so.mapped_column(
        sa.ForeignKey("user.id"), index=True
    )
    comments: so.Mapped[str | None] = so.mapped_column(
        sa.Text,
        default=None,
        nullable=True,
    )
    effective_datetime: so.Mapped[datetime] = so.mapped_column(
        sa.DateTime(timezone=True), nullable=False, default=datetime.now
    )
    submitted_datetime: so.Mapped[datetime] = so.mapped_column(
        sa.DateTime(timezone=True), nullable=True
    )
    moderation_status: so.Mapped[ModerationStatus | None] = so.mapped_column(
        sa.Enum(ModerationStatus, create_constraint=False, native_enum=False),
        nullable=True,
    )


class SubmissionStatusUpdate(SubmissionUpdate):
    """Docstring TODO"""

    __tablename__ = "bikeparking_submission_status_updates"
    __versioned__ = {}

    user_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey("user.id"), index=True)
    status_type: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("bikeparking_statuses.id"), index=True
    )


class SubmissionComment(SubmissionUpdate):
    """Docstring TODO"""

    __tablename__ = "bikeparking_submission_comments"
    __versioned__ = {}

    comments: so.Mapped[str] = so.mapped_column(
        sa.Text,
        default=None,
        nullable=False,
    )
    visibility: so.Mapped[VisibilityStatus] = so.mapped_column(
        sa.Enum(VisibilityStatus, create_constraint=False, native_enum=False),
        nullable=False,
        default=VisibilityStatus.PUBLIC,
    )
