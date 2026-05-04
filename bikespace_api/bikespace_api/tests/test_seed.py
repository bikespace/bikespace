import pytest
from pytest import mark
from sqlalchemy import text

from bikespace_api import db
from bikespace_api.admin.admin_models import Role
from bikespace_api.seed import seed_base_data


@mark.uses_db
def test_seed_base_data_skips_existing_roles(flask_app):
    """The role guard (line 71) takes the False branch when roles already exist."""
    with flask_app.app_context():
        meta = db.metadata
        table_names = ", ".join(f'"{t.name}"' for t in meta.sorted_tables)
        db.session.execute(
            text(f"TRUNCATE TABLE {table_names} RESTART IDENTITY CASCADE")
        )
        db.session.commit()

        db.session.add(Role(name="user"))
        db.session.add(Role(name="superuser"))
        db.session.commit()

        seed_base_data()

        roles = db.session.query(Role).all()
        assert {r.name for r in roles} == {"user", "superuser"}
