import json
from contextlib import contextmanager
from typing import Generator
from unittest.mock import patch, MagicMock, AsyncMock

from unittest import TestCase
from urllib.parse import unquote

import pytest
from flask import Flask, ctx

from api.blueprints.auth import auth_cognito_login_callback
from api.cognito.user import UserBlockedException, UserRegistrationCloseException
from api.models.user import User, UserStatus
from api.principal.role import Role

from ..principal.role_actions import PERMISSIONS_BY_ROLE


@pytest.mark.usefixtures("app")
class TestAuth(TestCase):
    """Test cases for the auth blueprint."""

    app: Flask

    @contextmanager
    def patched_context(
        self,
    ) -> Generator[
        tuple[ctx.RequestContext, MagicMock | AsyncMock, MagicMock | AsyncMock], None, None
    ]:
        with (
            self.app.test_request_context() as request_context,
            patch("api.blueprints.auth.login_user") as login_mock,
            patch("api.blueprints.auth.map_account") as map_account_mock,
        ):
            yield request_context, login_mock, map_account_mock

    def test_auth_cognito_login_success(self) -> None:
        with self.patched_context() as (request_context, login_mock, map_account_mock):
            request_context.session["user_info"] = "COGNITO-INFO"
            user_to_login = User(
                id=1,
                ntid="321234",
                email="success-login@example.com",
                name="Success login",
                role=Role.AUTHENTICATED.value,
                status=UserStatus.ACTIVE.value,
            )
            map_account_mock.return_value = user_to_login
            response = auth_cognito_login_callback()

            map_account_mock.assert_called_with("COGNITO-INFO", User)

            # Make sure that user was logged-in into the Flask application.
            login_mock.assert_called_once()
            self.assertEqual(login_mock.call_args_list[0][0][0], user_to_login)

            # Verify that user information has been passed to the client App.
            cookies = unquote(str(response.headers.get("Set-Cookie")))
            expected_user_data = json.dumps(
                {
                    **user_to_login.to_json(),
                    "permissions": PERMISSIONS_BY_ROLE[Role(user_to_login.role)],
                },
                separators=(",", ":"),
            )
            self.assertTrue(expected_user_data in cookies)

            # Make sure that redirect performed correctly.
            self.assertEqual(response.status, "302 FOUND")
            self.assertEqual(response.headers.get("Location"), "/")

    def test_auth_cognito_login_blocked(self) -> None:
        with self.patched_context() as (_, login_mock, map_account_mock):
            map_account_mock.side_effect = UserBlockedException("message")
            response = auth_cognito_login_callback()

            login_mock.assert_not_called()

            # Make sure that redirect performed correctly.
            self.assertEqual(response.status, "302 FOUND")
            self.assertEqual(response.headers.get("Location"), "/login?error=user-blocked")

    def test_auth_cognito_login_registration_required(self) -> None:
        with self.patched_context() as (_, login_mock, map_account_mock):
            map_account_mock.side_effect = UserRegistrationCloseException("message")
            response = auth_cognito_login_callback()

            login_mock.assert_not_called()

            # Make sure that redirect performed correctly.
            self.assertEqual(response.status, "302 FOUND")
            self.assertEqual(
                response.headers.get("Location"),
                "/login?error=user-registration-close",
            )
