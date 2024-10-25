import json
from datetime import datetime

from api.principal.role import Role
from api.models.user import User, UserStatus

from .test_case_list_base import TestCaseListBase


class TestUsersList(TestCaseListBase[User]):
    """Contains tests for the user list endpoint."""

    def setUp(self) -> None:
        self.model_import_path = "api.restful.users.User"

        self.response_list_items = [
            User(
                id=4,
                ntid="ntid",
                email="test+user-listing@example.com",
                name="Test Test User",
                role=Role.ADMIN.value,
                status=UserStatus.ACTIVE.value,
                created_at=datetime(2023, 5, 15),
                updated_at=datetime(2023, 5, 16),
            )
        ]

        self.expected_data = {
            "items": [
                {
                    "id": item.id,
                    "name": item.name,
                    "email": item.email,
                    "role": item.role,
                    "is_active": True,
                    "created_at": item.created_at.isoformat(),
                    "updated_at": item.updated_at.isoformat(),
                }
                for item in self.response_list_items
            ],
            "pager": {"total": 1, "page": 1, "per_page": 10},
            "sort": [{"id": "name", "desc": False}],
            "filters": {"status_filter": UserStatus.ACTIVE.value},
        }

        super().setUp()

    def test_users_default(self) -> None:
        with self.patched_context() as (http_client, mock_query):
            mock_query.filter().order_by().paginate.return_value = self.mock_paginate
            response = http_client.get("/users")

            self.assertEqual(response.status_code, 200)
            self.assertEqual(json.loads(response.data), self.expected_data)
            self.assert_sql_mock_called_with(
                mock_query.filter,
                User.status == UserStatus.ACTIVE.value,  # type: ignore[arg-type]
            )
            self.assert_sql_mock_called_with(
                mock_query.filter().order_by,
                User.name.asc(),
            )

    def test_users_sorting(self) -> None:
        with self.patched_context() as (http_client, mock_query):
            mock_query.filter().order_by().paginate.return_value = self.mock_paginate
            response = http_client.get("/users?sort=email&order=desc")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(
                json.loads(response.data),
                {**self.expected_data, "sort": [{"id": "email", "desc": True}]},
            )

            self.assert_sql_mock_called_with(
                mock_query.filter,
                User.status == UserStatus.ACTIVE.value,  # type: ignore[arg-type]
            )
            self.assert_sql_mock_called_with(
                mock_query.filter().order_by,
                User.email.desc(),
            )

    def test_users_filters(self) -> None:
        with self.patched_context() as (http_client, mock_query):
            mock_query.filter().filter().order_by().paginate.return_value = self.mock_paginate

            response = http_client.get("/users?role_filter=2")

            self.assertEqual(response.status_code, 200)

            self.assertEqual(
                json.loads(response.data),
                {
                    **self.expected_data,
                    "filters": {"role_filter": "2", "status_filter": UserStatus.ACTIVE.value},
                },
            )

            self.assert_sql_mock_called_with(
                mock_query.filter().filter,
                User.role == "2",  # type: ignore[arg-type]
            )
            self.assert_sql_mock_called_with(
                mock_query.filter().filter().order_by,
                User.name.asc(),
            )

    def test_get_users_exceptions(self) -> None:
        with self.logged_in_context(self.logged_in_user) as http_client:
            # 1) Test unknown sort param.
            response = http_client.get("/users?sort=undefined")
            self.assertEqual(response.status_code, 500)
            expected_response = {"message": "undefined sort is not supported"}
            self.assertEqual(json.loads(response.data), expected_response)

            # 2) Test unknown order param.
            response = http_client.get("/users?order=undefined")
            self.assertEqual(response.status_code, 500)
            expected_response = {"message": "undefined sort order is not supported"}
            self.assertEqual(json.loads(response.data), expected_response)

            # 3) Test unknown filter param.
            response = http_client.get("/users?undefined_filter=undefined")
            self.assertEqual(response.status_code, 500)
            expected_response = {"message": "undefined_filter filter is not supported"}
            self.assertEqual(json.loads(response.data), expected_response)
