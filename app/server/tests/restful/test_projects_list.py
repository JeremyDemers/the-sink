import json
from datetime import datetime
from sqlalchemy.orm import aliased

from api.models.project import Project, ProjectStatus
from api.models.user import User

from .test_case_list_base import TestCaseListBase


class TestProjectsList(TestCaseListBase[Project]):
    """Contains tests for the users endpoints."""

    def setUp(self) -> None:
        self.model_import_path = "api.restful.projects.Project"

        self.response_list_items = [
            Project(
                id=3,
                status=ProjectStatus.DRAFT.value,
                title="The test project",
                description="Project description",
                author_id=self.logged_in_user.id,
                author=self.logged_in_user,
                created_at=datetime(2024, 5, 17),
                updated_at=datetime(2024, 5, 18),
            )
        ]

        self.expected_data = {
            "items": [
                {
                    "id": item.id,
                    "title": item.title,
                    "author": {
                        "id": self.logged_in_user.id,
                        "name": self.logged_in_user.name,
                    },
                    "status": item.status,
                    "created_at": item.created_at.isoformat(),
                    "updated_at": item.updated_at.isoformat(),
                }
                for item in self.response_list_items
            ],
            "pager": {"total": 1, "page": 1, "per_page": 10},
            "sort": [{"id": "created_at", "desc": True}],
            "filters": {
                "status_filter": f"{ProjectStatus.DRAFT.value},{ProjectStatus.COMPLETED.value}",
            },
        }

        super().setUp()

    def test_projects_default(self) -> None:
        with self.patched_context() as (http_client, mock_query):
            # Mock for the chain: Project.query.filter().order_by().paginate().
            mock_query.filter().order_by().paginate.return_value = self.mock_paginate
            response = http_client.get("/projects")

            self.assertEqual(response.status_code, 200)
            self.assertEqual(json.loads(response.data), self.expected_data)

            self.assert_sql_mock_called_with(
                mock_query.filter,
                Project.status.in_([ProjectStatus.DRAFT.value, ProjectStatus.COMPLETED.value]),
            )

            self.assert_sql_mock_called_with(
                mock_query.filter().order_by, Project.created_at.desc()
            )

    def test_projects_sorting(self) -> None:
        with self.patched_context() as (http_client, mock_query):
            # Mock for the chain: Project.query.filter().order_by().paginate().
            mock_query.filter().join().order_by().paginate.return_value = self.mock_paginate
            response = http_client.get("/projects?sort=author_name&order=asc")

            self.assertEqual(response.status_code, 200)
            self.assertEqual(
                json.loads(response.data),
                {**self.expected_data, "sort": [{"id": "author_name", "desc": False}]},
            )

            self.assert_sql_mock_called_with(
                mock_query.filter,
                Project.status.in_([ProjectStatus.DRAFT.value, ProjectStatus.COMPLETED.value]),
            )

            self.assert_sql_mock_called_with(
                mock_query.filter().join().order_by, aliased(User).name.asc()
            )

    def test_projects_filters(self) -> None:
        with self.patched_context() as (http_client, mock_query):
            mock_query.filter().filter().order_by().paginate.return_value = self.mock_paginate

            response = http_client.get("/projects?title_filter=test&status_filter=completed")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(
                json.loads(response.data),
                {
                    **self.expected_data,
                    "filters": {
                        "title_filter": "test",
                        "status_filter": ProjectStatus.COMPLETED.value,
                    },
                },
            )

            self.assert_sql_mock_called_with(
                mock_query.filter, Project.status.in_([ProjectStatus.COMPLETED.value])
            )

            self.assert_sql_mock_called_with(
                mock_query.filter().filter, Project.title.ilike("%test%")
            )
