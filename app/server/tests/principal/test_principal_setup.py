from flask import g, Flask
from flask_login import current_user
from flask_principal import Identity, RoleNeed

from api.principal.role import Role
from api.principal import (
    identity_loader,
    assign_user_roles_permissions,
    principal_identity_changed,
    get_actions,
)
from api.models.user import User, UserStatus

from .role_actions import PERMISSIONS_BY_ROLE

from ..conftest import configure_app_fixture


def _auth_user() -> User:
    return User(
        ntid="123456",
        email="test@example.com",
        name="Test User",
        role=Role.ADMIN.value,
        status=UserStatus.ACTIVE.value,
    )


@configure_app_fixture(auth_user=_auth_user)
def test_identity_loader(
    app: Flask,  # pylint: disable=locally-disabled, unused-argument
) -> None:
    identity = identity_loader()
    assert isinstance(identity, Identity)
    assert identity.id == current_user.id


@configure_app_fixture(auth_user=_auth_user)
def test_assign_user_roles_permissions(app: Flask) -> None:
    identity = Identity(current_user.id)
    assign_user_roles_permissions(app, identity)

    assert RoleNeed(current_user.role) in identity.provides
    for action in get_actions(Role(current_user.role)).values():
        assert action.issubset(identity.provides)


@configure_app_fixture(auth_user=_auth_user)
def test_identity_changed_signal(
    app: Flask,  # pylint: disable=locally-disabled, unused-argument
) -> None:
    for user_role in Role:
        current_user.role = user_role.value
        principal_identity_changed()

        assert g.identity.id == current_user.id
        assert RoleNeed(user_role) in g.identity.provides

        actions = get_actions(user_role)
        assert PERMISSIONS_BY_ROLE[user_role] == tuple(sorted(actions.keys()))

        for action in actions.values():
            assert action.issubset(g.identity.provides)
