from json import loads as json_loads
from time import sleep
from typing import Callable

from flask import Flask
from flask_login import current_user
from werkzeug.test import TestResponse  # type: ignore

from api.models.user import User, UserStatus
from api.principal.role import Role

from ..conftest import configure_app_fixture


_PROJECT_KEYS = (
    "allowed_transitions",
    "author",
    "created_at",
    "description",
    "id",
    "status",
    "title",
    "updated_at",
)


def _auth_user() -> User:
    return User(
        ntid="testuser01",
        email="test.user@gmail.com",
        name="Test User",
        role=Role.ADMIN.value,
        status=UserStatus.ACTIVE.value,
    )


def _compare_response(
    data_previous: dict,
    current: TestResponse,
    expected_code: int,
    get_changes: Callable[[dict], dict],
) -> dict:
    data_current = json_loads(current.data)
    assert current.status_code == expected_code
    assert isinstance(data_current, dict)
    changes = get_changes(data_current)
    assert isinstance(changes, dict)

    for key in changes:
        assert data_previous[key] != data_current[key]

    assert data_current == {**data_current, **changes}
    return data_current


@configure_app_fixture(auth_user=_auth_user)
def test_crud(app: Flask) -> None:
    client = app.test_client()
    response_create = client.post(
        "/projects",
        json={
            "title": "Project 1",
            "description": "This is a project 1.",
        },
    )
    data_create = json_loads(response_create.data)

    assert response_create.status_code == 201
    assert isinstance(data_create, dict)
    assert tuple(sorted(data_create.keys())) == _PROJECT_KEYS
    assert data_create["id"] == 1
    assert data_create["author"] == {"id": current_user.id, "name": current_user.name}
    assert data_create["title"] == "Project 1"
    assert data_create["description"] == "This is a project 1."
    assert data_create["allowed_transitions"] == ["complete", "archive"]
    assert len(data_create["created_at"]) == 19
    assert len(data_create["updated_at"]) == 19

    # Wait a second to ensure the `updated_at` changes.
    sleep(1)
    data_transition = _compare_response(
        data_previous=data_create,
        current=client.put(
            f"/projects/{data_create['id']}/transition/complete",
        ),
        expected_code=200,
        get_changes=lambda data: {
            "status": "completed",
            "updated_at": data["updated_at"],
            "allowed_transitions": ["back_to_draft", "archive"],
        },
    )

    # Ensure the completed project cannot be completed again.
    response_transition_blocked = client.put(f"/projects/{data_create['id']}/transition/complete")
    data_transition_blocked = json_loads(response_transition_blocked.data)

    assert response_transition_blocked.status_code == 400
    assert isinstance(data_transition_blocked, dict)
    assert data_transition_blocked == {"message": "Transition is not allowed"}

    # Wait a second to ensure the `updated_at` changes.
    sleep(1)
    data_update = _compare_response(
        data_previous=data_transition,
        current=client.put(
            f"/projects/{data_create['id']}",
            json={
                "description": "Changed description.",
            },
        ),
        expected_code=200,
        get_changes=lambda data: {
            "updated_at": data["updated_at"],
            "description": "Changed description.",
        },
    )

    _compare_response(
        data_previous=data_update,
        current=client.get(
            f"/projects/{data_create['id']}",
        ),
        expected_code=200,
        get_changes=lambda data: {},
    )

    response_delete = client.delete(f"/projects/{data_create['id']}")
    data_delete = json_loads(response_delete.data)

    assert response_delete.status_code == 200
    assert isinstance(data_delete, dict)
    assert data_delete == {"message": f'Entity has been deleted (PK: {data_create["id"]}).'}
