from typing import NotRequired, TypedDict, TypeVar

from flask import current_app

from api.models.user import User
from api.principal.role import Role


_UserModel = TypeVar("_UserModel", bound=User)


UserInfo = TypedDict(
    "UserInfo",
    {
        "email": str,
        "custom:ntid": str,
        "name": NotRequired[str],
        "family_name": NotRequired[str],
    },
)


class UserRegistrationCloseException(Exception):
    """User registration close exception"""


class UserBlockedException(Exception):
    """User blocked exception"""


def map_account(token: UserInfo, model: type[_UserModel] = User) -> _UserModel:
    ntid = token.get("custom:ntid")
    email: str = token.get("email", "").strip().lower()
    user: _UserModel | None = model.query.filter(model.email.ilike(email)).first()
    is_admin = email in current_app.config.get("ADMIN_USERS", ())

    if user:
        # Handle a user that already exists in the database.
        if not user.is_active:
            raise UserBlockedException(f"User account {user.email} ({user.id}) is blocked.")

        # The user existed before it was configured as an admin.
        # Give them the administrative privileges now.
        if is_admin and user.role != Role.ADMIN.value:
            user.role = Role.ADMIN.value
            user.save()

        return user

    if is_admin:
        # Handle a user that is configured to be an admin but
        # not yet recorded in the database. Such a person can
        # sign up even when the registration is disabled.
        role = Role.ADMIN.value
    elif not current_app.config.get("AWS_COGNITO_OPEN_REGISTRATION"):
        raise UserRegistrationCloseException(
            "This application is not open for registration. "
            "Please contact the administrator to get access."
        )
    else:
        # The new users are just authenticated ones by default.
        role = Role.AUTHENTICATED.value

    user = model(
        name=_format_incoming_name(token, email),
        role=role,
        ntid=ntid,
        email=email,
    )

    return user.save()


def _format_incoming_name(token: UserInfo, email: str) -> str:
    name = token.get("name")
    family_name = token.get("family_name")

    if not name and not family_name:
        return email

    return f"{name} {family_name}"


__all__ = [
    "map_account",
    "UserRegistrationCloseException",
    "UserBlockedException",
    "UserInfo",
]
