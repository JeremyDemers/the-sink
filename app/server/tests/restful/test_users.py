from json import loads as json_loads

from flask import Flask
from flask_login import current_user

from api.models.user import User, UserStatus
from api.principal.role import Role
from api.restful.users import UserResource

from ..conftest import configure_app_fixture


def _get_user_scientist() -> User:
    return User(
        ntid="scientist1",
        email="test.scientist@gmail.com",
        name="Test Scientist",
        role=Role.SCIENTIST.value,
        status=UserStatus.ACTIVE.value,
    )


def _get_user_admin() -> User:
    return User(
        ntid="admin1",
        email="test.admin@gmail.com",
        name="Test Admin",
        role=Role.ADMIN.value,
        status=UserStatus.ACTIVE.value,
    )


@configure_app_fixture(auth_user=_get_user_admin)
def test_add_user(app: Flask) -> None:
    scientist_data = _get_user_scientist().to_json()
    response = app.test_client().post("/users", json=scientist_data)
    actual_data = json_loads(response.data)

    assert response.status_code == 201
    assert actual_data == {
        **scientist_data,
        "id": actual_data["id"],
        # The name is populated on login.
        "name": None,
        "created_at": actual_data["created_at"],
        "updated_at": actual_data["updated_at"],
    }


@configure_app_fixture(auth_user=_get_user_admin)
def test_get_user(app: Flask) -> None:
    scientist = _get_user_scientist().save()
    response = app.test_client().get(f"/users/{scientist.id}")

    assert response.status_code == 200
    assert json_loads(response.data) == scientist.to_json()


@configure_app_fixture(auth_user=_get_user_admin)
def test_edit_user(app: Flask) -> None:
    scientist = _get_user_scientist().save()
    response = app.test_client().put(
        f"/users/{scientist.id}",
        json={
            "role": Role.AUTHENTICATED.value,
        },
    )
    actual_data = json_loads(response.data)

    assert response.status_code == 200
    assert actual_data == {
        **scientist.to_json(),
        "id": scientist.id,
        "role": Role.AUTHENTICATED.value,
        "created_at": actual_data["created_at"],
        "updated_at": actual_data["updated_at"],
    }


@configure_app_fixture(auth_user=_get_user_admin)
def test_delete_user(app: Flask) -> None:
    scientist = _get_user_scientist().save()
    delete_response = app.test_client().delete(f"/users/{scientist.id}")

    assert delete_response.status_code == 200


@configure_app_fixture(auth_user=_get_user_scientist)
def test_current_user(app: Flask) -> None:
    response = app.test_client().get("/users/current")

    assert response.status_code == 200
    assert json_loads(response.data) == current_user.to_json()


@configure_app_fixture(auth_user=_get_user_scientist)
def test_edit_own_user_profile(app: Flask) -> None:
    response = app.test_client().put(
        f"/users/{current_user.id}",
        json={
            "role": Role.AUTHENTICATED.value,
        },
    )

    assert response.status_code == 403
    assert json_loads(response.data) == {"message": "Users can't edit their own profiles"}


@configure_app_fixture(auth_user=_get_user_scientist)
def test_delete_own_user_profile(app: Flask) -> None:
    response = app.test_client().delete(f"/users/{current_user.id}")

    assert response.status_code == 403
    assert json_loads(response.data) == {"message": "Users can't delete their own profiles"}


def test_process_upsert_request() -> None:
    resource = UserResource()
    data: dict = {}

    def _test(expected: dict) -> None:
        resource._process_upsert_request(  # pylint: disable=locally-disabled, protected-access
            data=data,
            entity=None,
        )
        assert data == {**data, **expected}

    _test({})

    data["is_active"] = True
    _test({"status": UserStatus.ACTIVE.value})

    data["is_active"] = False
    _test({"status": UserStatus.BLOCKED.value})
