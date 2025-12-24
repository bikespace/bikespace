from typing import Optional

import sqlalchemy.orm as so
from flask_security.core import RoleMixin, UserMixin

from bikespace_api import db  # type: ignore

roles_users = db.Table(
    "roles_users",
    db.Column("user_id", db.Integer(), db.ForeignKey("user.id")),
    db.Column("role_id", db.Integer(), db.ForeignKey("role.id")),
)


class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

    def __str__(self):
        return str(self.name or "")


class User(db.Model, UserMixin):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
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
    status_updates: so.WriteOnlyMapped[list["StatusUpdate"]] = so.relationship(
        back_populates="user"
    )
    submission_comments: so.WriteOnlyMapped[list["SubmissionComment"]] = (
        so.relationship(back_populates="user")
    )

    def __str__(self):
        return str(self.email or "")
