from flask import abort, redirect, request, url_for
from flask_admin.contrib.sqla import ModelView
from flask_security import current_user  # type: ignore

from bikespace_api.admin.roles import ApplicationRoles


class AdminBikeParkingStatusModelView(ModelView):
    column_display_pk = True
    column_list = [
        "id",
        "status_type",
        "status_name",
        "status_description",
        "hide_by_default",
        "created_at",
        "updated_at",
    ]
    form_columns = ["status_type", "status_name", "status_description", "hide_by_default"]

    def is_accessible(self):
        allowed_roles = [ApplicationRoles.SUPERUSER, ApplicationRoles.EDITOR]
        if not current_user:
            return False
        return (
            current_user.is_active
            and current_user.is_authenticated
            and any(current_user.has_role(role) for role in allowed_roles)
        )

    def _handle_view(self, name, **kwargs):
        if not self.is_accessible():
            if current_user and current_user.is_authenticated:
                abort(403)
            else:
                return redirect(url_for("security.login", next=request.url))
