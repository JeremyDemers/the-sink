from contextlib import contextmanager
from datetime import datetime
from typing import Any, Generator, Generic, Union
from unittest import TestCase
from unittest.mock import MagicMock, AsyncMock, patch

from flask import Flask
from flask.testing import FlaskClient
from sqlalchemy.sql.expression import BinaryExpression, UnaryExpression
from pytest import mark

from api.restful.restful_api import _Entity
from api.models.user import User, UserStatus
from api.principal.role import Role


@mark.usefixtures("app")
class TestCaseListBase(Generic[_Entity], TestCase):
    """
    Base class for the model list test suites.

    Attributes:
        model_import_path: Path to the model that has been tested
            @link https://docs.python.org/3/library/unittest.mock.html#id6
        response_list_items: Model entries that will be returned as a part of the get list
            response.
        logged_in_user: The instance of User model, on whose authority get requests will be
            performed. See TestCaseListBase.patched_context()
    """

    app: Flask

    model_import_path: str

    response_list_items: list[_Entity] = []

    logged_in_user = User(
        id=12,
        ntid="12345678",
        email="test+1@example.com",
        name="Test Test User",
        role=Role.ADMIN.value,
        status=UserStatus.ACTIVE.value,
        created_at=datetime(2022, 5, 15),
        updated_at=datetime(2022, 5, 16),
    )

    def setUp(self) -> None:
        self.mock_paginate = MagicMock(
            total=1,
            items=self.response_list_items,
            pages=1,
            per_page=10,
            page=1,
        )

    @contextmanager
    def logged_in_context(self, user: User) -> Generator[FlaskClient, None, None]:
        """
        Logs in given user in the application, allowing to perform HTTP requests as logged-in user.
        """
        with self.app.test_request_context():

            @self.app.login_manager.request_loader
            def load_user_from_request(_request: Any) -> User:
                return user

            yield self.app.test_client()

    @contextmanager
    def patched_context(self) -> Generator[tuple[FlaskClient, MagicMock | AsyncMock], None, None]:
        """
        Context that allows:
            - to perform http request as logged-in user, and exposes http_client.
            - mocks model query, and exposes mock_query.
        """
        if not self.model_import_path:
            raise NotImplementedError(
                "model_import_path is not defined, unable to mock model query"
            )

        with (
            self.logged_in_context(self.logged_in_user) as client,
            patch(f"{self.model_import_path}.query") as mock_query,
        ):
            yield client, mock_query

    @staticmethod
    def _are_sql_binary_expressions_equal(val1: BinaryExpression, val2: BinaryExpression) -> bool:
        """Checks whether to binary expressions are equal."""
        return bool(
            val1.left == val2.left
            and val1.operator == val2.operator
            and val1.right.value == val2.right.value
        )

    @staticmethod
    def _are_sql_unary_expressions_equal(val1: UnaryExpression, val2: UnaryExpression) -> bool:
        """Checks whether to unary expressions are equal."""
        return str(val1) == str(val2)

    def assert_sql_mock_called_with(
        self, mock: MagicMock, value: Union[BinaryExpression, UnaryExpression]
    ) -> None:
        """
        Allows to assert that sql filter and sort query has been called with a specific value.

        :param mock: The mock to run assertion with.
        :param value: The expected value, mock was called with.

        :return: If there is a match it will return None, otherwise it will fall back to the
        default mock assertion that most likely will raise an exception.
        """
        for call_args in mock.call_args_list:
            for arg in call_args.args:
                if (  # pylint: disable=too-many-boolean-expressions
                    isinstance(arg, BinaryExpression)
                    and isinstance(value, BinaryExpression)
                    and self._are_sql_binary_expressions_equal(arg, value)
                ) or (
                    isinstance(arg, UnaryExpression)
                    and isinstance(value, UnaryExpression)
                    and self._are_sql_unary_expressions_equal(arg, value)
                ):
                    return

        mock.assert_called_with(value)
