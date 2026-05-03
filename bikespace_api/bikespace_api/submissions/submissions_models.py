from datetime import datetime, timezone
from enum import Enum
from typing import List

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

    id: so.Mapped[int] = so.mapped_column(primary_key=True, autoincrement=True)
    latitude: so.Mapped[float] = so.mapped_column(nullable=False)
    longitude: so.Mapped[float] = so.mapped_column(nullable=False)
    issues: so.Mapped[List[IssueType] | None] = so.mapped_column(
        pg.ARRAY(sa.Enum(IssueType, create_constraint=False, native_enum=False)),
        nullable=True,
    )
    parking_duration: so.Mapped[ParkingDuration | None] = so.mapped_column(
        sa.Enum(ParkingDuration, create_constraint=False, native_enum=False),
        nullable=True,
    )
    parking_time: so.Mapped[datetime] = so.mapped_column(
        sa.DateTime, nullable=False, default=datetime.now
    )
    comments: so.Mapped[str | None] = so.mapped_column(
        sa.Text,
        default=None,
        nullable=True,
    )
    submitted_datetime: so.Mapped[datetime] = so.mapped_column(
        sa.DateTime(timezone=True), nullable=True
    )

    # __init__ params need to have a default value for revert from deleted state to work with sqlalchemy_continuum
    def __init__(
        self,
        latitude: float = None,  # type: ignore
        longitude: float = None,  # type: ignore
        issues: List[IssueType] = None,  # type: ignore
        parking_duration: ParkingDuration = None,  # type: ignore
        parking_time: datetime = None,  # type: ignore
        comments: str | None = None,
    ):
        self.latitude = latitude
        self.longitude = longitude
        self.issues = issues
        self.parking_duration = parking_duration
        self.parking_time = parking_time
        self.comments = comments
        self.submitted_datetime = datetime.now(timezone.utc)
