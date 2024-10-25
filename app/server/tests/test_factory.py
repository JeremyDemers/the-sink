from api import create_app


def test_config() -> None:
    assert create_app(
        {
            "TESTING": True,
            "CACHE_TYPE": "flask_caching.backends.NullCache",
            "SQLALCHEMY_DATABASE_URI": "sqlite:///postgres.db",
        }
    ).testing
