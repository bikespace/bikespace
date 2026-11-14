import pytest
from sqlalchemy import text

from bikespace_api import db
from bikespace_api.admin.admin_models import Role
from bikespace_api.admin.roles import ApplicationRoles
from bikespace_api.seed import seed_base_data, seed_statuses
from bikespace_api.statuses.statuses_models import BikeParkingStatus


@pytest.mark.uses_db
def test_seed_base_data_skips_existing_roles(flask_app):
    """The role guard (line 71) takes the False branch when roles already exist."""
    with flask_app.app_context():
        meta = db.metadata
        table_names = ", ".join(f'"{t.name}"' for t in meta.sorted_tables)
        db.session.execute(
            text(f"TRUNCATE TABLE {table_names} RESTART IDENTITY CASCADE")
        )
        db.session.commit()

        db.session.add(Role(name=ApplicationRoles.USER))
        db.session.add(Role(name=ApplicationRoles.EDITOR))
        db.session.add(Role(name=ApplicationRoles.SUPERUSER))
        db.session.commit()

        seed_base_data()

        roles = db.session.query(Role).all()
        assert {r.name for r in roles} == {  # pragma: no branch
            ApplicationRoles.USER,
            ApplicationRoles.EDITOR,
            ApplicationRoles.SUPERUSER,
        }


@pytest.mark.uses_db
def test_seed_statuses_skips_existing(flask_app):
    """The status guard takes the False branch when statuses already exist."""
    with flask_app.app_context():
        meta = db.metadata
        table_names = ", ".join(f'"{t.name}"' for t in meta.sorted_tables)
        db.session.execute(
            text(f"TRUNCATE TABLE {table_names} RESTART IDENTITY CASCADE")
        )
        db.session.commit()

        seed_statuses()
        seed_statuses()

        count = db.session.query(BikeParkingStatus).count()
        assert count == 14

        new_report_count = (
            db.session.query(BikeParkingStatus)
            .filter_by(internal_code="new_report")
            .count()
        )
        assert new_report_count == 1
