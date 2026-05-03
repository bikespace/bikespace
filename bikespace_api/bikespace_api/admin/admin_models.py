from datetime import datetime

import sqlalchemy as sa
import sqlalchemy.orm as so

from flask_security.core import RoleMixin, UserMixin

from bikespace_api import db  # type: ignore

roles_users = db.Table(
    "roles_users",
    db.Column("user_id", db.Integer(), db.ForeignKey("user.id")),
    db.Column("role_id", db.Integer(), db.ForeignKey("role.id")),
)


class Role(db.Model, RoleMixin):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(80), unique=True)
    description: so.Mapped[str | None] = so.mapped_column(sa.String(255), nullable=True)

    def __str__(self):
        return str(self.name or "")


class User(db.Model, UserMixin):
    """The confirmed_at value indicates when the user confirmed their email."""

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    first_name: so.Mapped[str] = so.mapped_column(sa.String(255))
    last_name: so.Mapped[str] = so.mapped_column(sa.String(255))
    email: so.Mapped[str] = so.mapped_column(sa.String(255), unique=True)
    password: so.Mapped[str] = so.mapped_column(sa.String(255))
    active: so.Mapped[bool] = so.mapped_column(sa.Boolean)
    confirmed_at: so.Mapped[datetime | None] = so.mapped_column(
        sa.DateTime, nullable=True
    )
    roles = db.relationship(
        "Role", secondary=roles_users, backref=db.backref("users", lazy="dynamic")
    )
    fs_uniquifier: so.Mapped[str] = so.mapped_column(
        sa.String(64), unique=True, nullable=False
    )

    def __str__(self):
        return str(self.email or "")
