from functools import wraps
from typing import Callable, Any

from flask import Flask, g, current_app, abort
from flask_login import current_user, login_required
from flask_principal import (
    Identity,
    RoleNeed,
    Principal,
    identity_loaded,
    identity_changed,
    AnonymousIdentity,
)
from flask_cognito_lib.decorators import auth_required

from .actions import get_actions
from .operation import Operation
from .role import Role


def identity_loader() -> Identity:
    """Let Flask principal know which user is currently logged in"""
    return Identity(current_user.id) if hasattr(current_user, "id") else AnonymousIdentity()


def assign_user_roles_permissions(_sender: Flask, identity: Identity) -> None:
    """Assign user roles and permissions to the Flask Principal identity"""
    identity.user = current_user
    if hasattr(current_user, "role"):
        identity.provides.add(RoleNeed(current_user.role))
        identity.provides.update(*get_actions(Role(current_user.role)).values())


principal = Principal(None, False)

# Register subscribers, responsible for user permissions logic.
principal.identity_loader(identity_loader)
identity_loaded.connect(assign_user_roles_permissions)


def principal_identity_changed() -> None:
    """The wrapper around identity_changed.send signal."""
    identity_changed.send(
        current_app._get_current_object(),  # pylint: disable=locally-disabled, protected-access
        identity=identity_loader(),
    )


def authentication_required(can: Operation | None = None) -> Callable:
    """
    Decorator that makes sure - user is authenticated in flask and cognito.

    Parameters
    ----------
    can
        If set, additionally checks that current user has permission to execute this action.

    Returns
    -------
    Decorated function.
    """

    def decorator(f: Callable) -> Callable:
        @wraps(f)
        @login_required
        @auth_required()
        def decorated_function(*args: Any, **kwargs: Any) -> Callable:
            # Cognito: auth_required: triggers requests execution which leads to global context
            # lost, where Flask principal has stored information about current Identity,
            # re-initialize it:
            if not hasattr(g, "identity"):
                principal_identity_changed()

            # Note: the `can` has `__bool__` method.
            if can is not None and not can:
                abort(403)

            return f(*args, **kwargs)  # type: ignore[no-any-return]

        return decorated_function  # type: ignore[no-any-return]

    return decorator
