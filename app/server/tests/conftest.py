from typing import Callable, Generator, Literal

from flask import g, Flask, Request
from pytest import fixture, mark
from _pytest.fixtures import SubRequest, MarkDecorator

from api import create_app
from api.config import Config
from api.database import db
from api.models import User


@fixture
def app(request: SubRequest) -> Generator[Flask, None, None]:
    _app = create_app(
        {
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///postgres.db",
            "CACHE_TYPE": "flask_caching.backends.NullCache",
            "SECRET_KEY": "very!",
            "AWS_COGNITO_DISABLED": True,
            "AWS_COGNITO_COOKIE_AGE_SECONDS": 1111,
            "SESSION_COOKIE_NAME_AUTH": Config.SESSION_COOKIE_NAME_AUTH,
        },
    )

    if request.cls:
        request.cls.app = _app

    if hasattr(request, "param"):
        assert isinstance(request.param, dict)
        features = request.param.get("features", ())
        assert isinstance(features, tuple)
        get_auth_user = request.param.get("auth_user")
        assert get_auth_user is None or callable(get_auth_user)
        auth_user = get_auth_user() if get_auth_user else None
        assert auth_user is None or isinstance(auth_user, User)
        assert not auth_user or "db" in features

        with _app.test_request_context():
            if "db" in features:
                db.drop_all()
                db.create_all()

            if auth_user:
                # Ensure the user didn't exist.
                assert auth_user.id is None
                # Preserve an account.
                auth_user.save()  # type: ignore[unreachable]
                # Ensure the account is preserved.
                # noinspection PyTypeChecker
                assert auth_user.id > 0

            # Set the logged-in user.
            g._login_user = auth_user  # pylint: disable=locally-disabled, protected-access

            @_app.login_manager.request_loader  # pylint: disable=locally-disabled, no-member
            def load_user_from_request(_request: Request) -> User | None:
                return auth_user

            yield _app
    else:
        yield _app


def configure_app_fixture(
    auth_user: Callable[[], User] | None = None,
    with_db: Literal[True] | None = None,
) -> MarkDecorator:
    """
    Configures the `app` fixture.

    :param auth_user: The function that produces the current user of the app.
    :param with_db: Whether the database is required. Automatically `True`
     when the `auth_user` is provided.
    :return: The configured `app` fixture.
    """
    assert auth_user is None or callable(auth_user)
    assert with_db is None or with_db is True
    features: set[str] = set()

    if auth_user or with_db:
        features.add("db")

    return mark.parametrize(
        "app",
        (
            {
                "features": tuple(features),
                "auth_user": auth_user,
            },
        ),
        indirect=["app"],
    )
