import uuid

from flask import abort, redirect, request, url_for
from flask_admin.contrib.sqla import ModelView
from flask_security import current_user
from wtforms import SelectField

from bikespace_api.api.models import IssueType, ParkingDuration


class AdminRolesModelView(ModelView):
    def is_accessible(self):
        return (
            current_user.is_active
            and current_user.is_authenticated
            and current_user.has_role("superuser")
        )

    def _handle_view(self, name, **kwargs):
        """
        Override builtin _handle_view in order to redirect users when a view is not accessible.
        """
        if not self.is_accessible():
            if current_user.is_authenticated:
                # permission denied
                abort(403)
            else:
                # login
                return redirect(url_for("security.login", next=request.url))


class AdminUsersModelView(ModelView):
    can_export = True
    column_hide_backrefs = False
    column_list = ("first_name", "last_name", "email", "active", "roles")
    column_labels = {
        "first_name": "First Name",
        "last_name": "Last Name",
        "email": "Email",
        "active": "Active",
        "roles": "Roles",
    }
    form_excluded_columns = ["fs_uniquifier", "password", "confirmed_at"]

    def is_accessible(self):
        return (
            current_user.is_active
            and current_user.is_authenticated
            and current_user.has_role("superuser")
        )

    def _handle_view(self, name, **kwargs):
        """
        Override builtin _handle_view in order to redirect users when a view is not
        accessible.
        """
        if not self.is_accessible():
            if current_user.is_authenticated:
                # permission denied
                abort(403)
            else:
                # login
                return redirect(url_for("security.login", next=request.url))

    def on_model_change(self, form, model, is_created):
        if model.fs_uniquifier is None:
            model.fs_uniquifier = uuid.uuid4().hex


class AdminSubmissionModelView(ModelView):
    can_export = True

    def is_accessible(self):
        return (
            current_user.is_active
            and current_user.is_authenticated
            and current_user.has_role("superuser")
        )

    def _handle_view(self, name, **kwargs):
        """
        Override builtin _handle_view in order to redirect users when a view is not
        accessible.
        """
        if not self.is_accessible():
            if current_user.is_authenticated:
                # permission denied
                abort(403)
            else:
                # login
                return redirect(url_for("security.login", next=request.url))
