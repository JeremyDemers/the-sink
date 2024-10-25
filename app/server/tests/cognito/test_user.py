from typing import Any, Self

from flask import Flask
from pytest import mark, raises

from api.cognito.user import (
    map_account,
    UserRegistrationCloseException,
    UserBlockedException,
    UserInfo,
)
from api.models.user import User, UserStatus
from api.principal.role import Role

from ..conftest import configure_app_fixture


class _User(User):
    saved_times = 0

    def save(self, *args: Any, **kwargs: Any) -> Self:
        self.saved_times += 1

        return super().save(*args, **kwargs)


def _test_context() -> tuple[UserInfo, _User]:
    token: UserInfo = {
        "custom:ntid": "BONDJ07",
        "email": "test@example.loc",
    }

    user = _User(
        ntid=token["custom:ntid"],
        name="Test Test",
        email=token["email"],
        role=Role.AUTHENTICATED.value,
        status=UserStatus.ACTIVE.value,
    )

    return token, user


@configure_app_fixture(with_db=True)
def test_map_account_close_registration(app: Flask) -> None:
    token, _ = _test_context()
    app.config["AWS_COGNITO_OPEN_REGISTRATION"] = False

    with raises(UserRegistrationCloseException) as error:
        map_account(token)

    assert (
        "This application is not open for registration. "
        "Please contact the administrator to get access."
    ) in str(error.value)


@configure_app_fixture(with_db=True)
def test_map_account_blocked(
    app: Flask,  # pylint: disable=locally-disabled, unused-argument
) -> None:
    token, user = _test_context()
    user.status = UserStatus.BLOCKED.value
    user.save()

    with raises(UserBlockedException) as error:
        map_account(token)

    assert f"User account {user.email} ({user.id}) is blocked." in str(error.value)


@configure_app_fixture(with_db=True)
@mark.parametrize(
    ("expected_role",),
    (
        (Role.ADMIN,),
        (Role.AUTHENTICATED,),
    ),
)
@mark.parametrize(
    ("is_existing_user",),
    (
        (True,),
        (False,),
    ),
)
def test_map_account_success(
    app: Flask,
    expected_role: Role,
    is_existing_user: bool,
) -> None:
    token, user = _test_context()
    # Ensure the user in unsaved.
    assert not user.id
    # The default role must be `AUTHENTICATED`.
    assert user.role == Role.AUTHENTICATED.value

    if is_existing_user:
        # Make sure the user exists.
        user.save()
        # Reset the above save as it's a known one
        # needed solely for setting up the test.
        user.saved_times -= 1
        expects_save = False
    else:
        # Allow registering new users.
        app.config["AWS_COGNITO_OPEN_REGISTRATION"] = True
        # Expect the account creation.
        expects_save = True

    # Check that a non-admin becomes admin on the
    # login.
    if expected_role == Role.ADMIN:
        app.config["ADMIN_USERS"] = (user.email, *app.config.get("ADMIN_USERS", ()))
        # A save is expected because the user role
        # should change from `AUTHENTICATED` to `ADMIN`.
        expects_save = True

    account = map_account(token, _User)
    assert account.id
    assert account.role == expected_role.value
    assert account.saved_times == int(expects_save)
