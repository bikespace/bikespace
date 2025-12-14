import uuid

from flask import abort, redirect, request, url_for
from flask_admin.contrib.sqla import ModelView
from flask_security import current_user  # type: ignore
from flask_security.utils import hash_password
from wtforms import PasswordField
from wtforms.fields import DateTimeField


class DateTimeWithMicrosecondsField(DateTimeField):
    """
    Modified version of DateTimeField to prevent truncation of microseconds (and therefore data loss) that happens with default wtforms widget used by flask-admin.

    Required input format is YYYY-MM-DDTHH:MM:SS.ssssss
    """

    def __init__(
        self, label=None, validators=None, format="%Y-%m-%dT%H:%M:%S.%f", **kwargs
    ):
        super(DateTimeWithMicrosecondsField, self).__init__(
            label, validators, format=format, **kwargs
        )


class AdminRolesModelView(ModelView):
    column_display_pk = True

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


class AdminUsersModelView(ModelView):
    column_hide_backrefs = False
    column_list = ("first_name", "last_name", "email", "active", "roles")
    column_labels = {
        "first_name": "First Name",
        "last_name": "Last Name",
        "email": "Email",
        "active": "Active",
        "roles": "Roles",
    }
    form_excluded_columns = "fs_uniquifier"

    form_overrides = {"password": PasswordField}

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
        if is_created:
            model.password = hash_password(form.password.data)
            model.fs_uniquifier = uuid.uuid4().hex
        else:
            old_password = form.password.object_data
            # If password has been changed, hash password
            if not old_password == model.password:
                model.password = hash_password(form.password.data)


class AdminSubmissionModelView(ModelView):
    column_display_pk = True
    form_overrides = {
        "parking_time": DateTimeWithMicrosecondsField,
        "submitted_datetime": DateTimeWithMicrosecondsField,
    }
    form_args = {"submitted_datetime": {"validators": []}}  # make nullable

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
