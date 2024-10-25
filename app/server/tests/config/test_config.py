from os import environ
from importlib import reload
from unittest.mock import patch

from pytest import mark, raises, MonkeyPatch

from api import create_app
import api.config


@mark.parametrize(
    ("variables", "expectations"),
    (
        (
            {
                "APP_ENV": "dev",
            },
            {
                "ENV": "development",
                "AWS_COGNITO_COOKIE_AGE_SECONDS": 3600,
            },
        ),
        (
            {
                "APP_ENV": "prod",
                "AWS_COGNITO_COOKIE_AGE_SECONDS": "7200",
            },
            {
                "ENV": "production",
                "AWS_COGNITO_COOKIE_AGE_SECONDS": 7200,
            },
        ),
    ),
)
def test_config_detection(monkeypatch: MonkeyPatch, variables: dict, expectations: dict) -> None:
    with patch("api.db"), patch("api.cache"):
        for name, value in variables.items():
            monkeypatch.setenv(name, value)

        reload(api.config)
        app = create_app()

        for name, value in expectations.items():
            assert app.config[name] == value, name


def test_unknown_environment_config() -> None:
    environ["APP_ENV"] = "unknown-config"

    with raises(Exception):
        create_app()
