from datetime import datetime, timezone
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


class BikeParkingStatus(db.Model):
    __tablename__ = "bikeparking_statuses"
    __versioned__ = {}

    id: so.Mapped[int] = so.mapped_column(primary_key=True, autoincrement=True)
    status_type: so.Mapped[str] = so.mapped_column(sa.String, nullable=False, unique=True)
    status_name: so.Mapped[StatusName] = so.mapped_column(
        sa.Enum(StatusName, create_constraint=False, native_enum=False),
        nullable=False,
    )
    status_description: so.Mapped[str] = so.mapped_column(sa.Text, nullable=False)
    hide_by_default: so.Mapped[bool] = so.mapped_column(
        sa.Boolean, nullable=False, default=False
    )
    created_at: so.Mapped[datetime] = so.mapped_column(
        sa.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: so.Mapped[datetime] = so.mapped_column(
        sa.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __init__(
        self,
        status_type: str = None,  # type: ignore
        status_name: StatusName = None,  # type: ignore
        status_description: str = None,  # type: ignore
        hide_by_default: bool = False,
    ):
        self.status_type = status_type
        self.status_name = status_name
        self.status_description = status_description
        self.hide_by_default = hide_by_default
        self.created_at = datetime.now(timezone.utc)
        self.updated_at = datetime.now(timezone.utc)
