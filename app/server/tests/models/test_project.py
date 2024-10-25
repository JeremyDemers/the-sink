from unittest.mock import Mock

from flask import Flask
from flask_login import current_user

from api.models.user import User, UserStatus
from api.models.project import Project, ProjectStatus
from api.principal.role import Role

from ..conftest import configure_app_fixture


def _auth_user() -> User:
    return User(
        ntid="testscientist01",
        email="test.scientist@gmail.com",
        name="Test User",
        role=Role.SCIENTIST.value,
        status=UserStatus.ACTIVE.value,
    )


@configure_app_fixture(auth_user=_auth_user)
def test_project_transitions(app: Flask) -> None:
    project = Project(
        id=3,
        title="The test project",
        description="Project description",
        author_id=1,
    )

    app.logger = Mock()  # type: ignore[misc]
    project.trigger("complete", original_status=project.status)  # type: ignore[attr-defined]
    assert project.status == ProjectStatus.COMPLETED.value
    assert project.allowed_transitions == ["back_to_draft", "archive"]
    app.logger.info.assert_called_with(
        'Project "The test project"[3] status has changed from draft to completed'
        f" by {current_user.email}"
    )

    project.trigger("archive", original_status=project.status)  # type: ignore[attr-defined]
    assert project.status == ProjectStatus.ARCHIVED.value
    assert project.allowed_transitions == ["restore"]

    project.trigger("restore", original_status=project.status)  # type: ignore[attr-defined]
    assert project.status == ProjectStatus.DRAFT.value
    assert project.allowed_transitions == ["complete", "archive"]
