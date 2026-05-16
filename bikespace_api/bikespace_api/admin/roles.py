from enum import StrEnum


class ApplicationRoles(StrEnum):
    """
    Collection of strings used for role-based permissions.

    Intended permissions:

    - USER: ability to manage own submissions (not implemented) and own account
    - EDITOR: ability to manage submissions and updates plus USER privileges
    - SUPERUSER: ability to manage users and roles, plus EDITOR privileges
    """

    USER = "user"
    EDITOR = "editor"
    SUPERUSER = "superuser"
