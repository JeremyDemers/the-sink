import json
import time
from typing import Callable
from urllib.parse import quote

from flask import Blueprint, current_app, redirect, session
from flask_cognito_lib.decorators import (
    cognito_auth,
    cognito_login_callback,
    cognito_login as cognito_login_decorator,
    cognito_refresh_callback,
    cognito_logout as cognito_logout_decorator,
    remove_from_session,
)
from flask_login import login_user, logout_user, current_user

from werkzeug import Response

from api.cognito.user import (
    map_account,
    UserRegistrationCloseException,
    UserBlockedException,
    UserInfo,
)
from api.models.user import User
from api.principal import principal_identity_changed, get_actions, Role


auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


def process_user_info(response: Response, fresh: bool = True) -> None:
    user_info = session.get("user_info")
    user = map_account(user_info, User)
    cookie_auth = {
        "user": {
            **user.to_json(),  # type: ignore
            "permissions": tuple(sorted(get_actions(Role(user.role)).keys())),
        },
        "expires": int(time.time()) + current_app.config["AWS_COGNITO_COOKIE_AGE_SECONDS"],
        "expires_in": current_app.config["AWS_COGNITO_COOKIE_AGE_SECONDS"],
    }

    login_user(user, fresh=fresh)

    response.set_cookie(
        key=current_app.config["SESSION_COOKIE_NAME_AUTH"],
        value=quote(json.dumps(cookie_auth, separators=(",", ":"))),
        max_age=current_app.config["AWS_COGNITO_COOKIE_AGE_SECONDS"],
        samesite=current_app.config["SESSION_COOKIE_SAMESITE"],
        secure=current_app.config["SESSION_COOKIE_SECURE"],
    )

    if fresh:
        principal_identity_changed()
        current_app.logger.info(f'Logged in user "{user.email}"')
    else:
        current_app.logger.info(f'Refreshed session for the user "{user.email}"')


@auth_bp.route("/cognito/login", strict_slashes=False)
@cognito_login_decorator
def cognito_login() -> None:
    # A simple route that will redirect to the Cognito Hosted UI.
    # No logic is required as the decorator handles the redirect to the Cognito
    # hosted UI for the user to sign in.
    pass


@auth_bp.route("/cognito", strict_slashes=False)
@cognito_login_callback
def cognito() -> Response:
    return auth_cognito_login_callback()


def auth_cognito_login_callback() -> Response:
    """
    The Cognito login callback.
    It was decoupled from the actual router callback to simplify unit test strategy.
    """
    try:
        response = redirect(location="/")
        process_user_info(response=response)
    except UserRegistrationCloseException:
        response = redirect("/login?error=user-registration-close")
    except UserBlockedException:
        response = redirect("/login?error=user-blocked")

    return response


def cognito_refresh_inner() -> Response:
    response = Response()
    process_user_info(response=response, fresh=False)
    return response


cognito_refresh_outer: Callable[[], Response] = cognito_refresh_callback(cognito_refresh_inner)


@auth_bp.route("/cognito/refresh", strict_slashes=False, methods=["POST"])
def cognito_refresh() -> Response:
    return cognito_refresh_inner() if cognito_auth.cfg.disabled else cognito_refresh_outer()


@auth_bp.route("/cognito/logout", strict_slashes=False)
@cognito_logout_decorator
def cognito_logout() -> None:
    pass


@auth_bp.route("/cognito/post-logout", strict_slashes=False)
def cognito_post_logout() -> Response:
    email = current_user.email if current_user and current_user.is_authenticated else None
    # @todo Redirect to frontend with error flag if fails.
    response = redirect(location="/")
    remove_from_session(
        (
            "claims",
            "user_info",
            "refresh_token",
            "code_verifier",
            "code_challenge",
            "nonce",
            "state",
            "identity.id",
            "identity.auth_type",
        ),
    )
    logout_user()
    response.delete_cookie(current_app.config["SESSION_COOKIE_NAME_AUTH"])

    if email:
        current_app.logger.info(f'Logged out user "{email}"')

    principal_identity_changed()

    return response


@auth_bp.route("/cognito/fake", strict_slashes=False)
def cognito_spoof() -> Response:
    response = redirect(location="/")
    user_info: UserInfo | None = current_app.config.get("FAKE_USER_INFO")

    if not cognito_auth.cfg.disabled or not user_info:
        return response

    session["user_info"] = user_info
    process_user_info(response=response)
    return response


__all__ = [
    "auth_bp",
]
