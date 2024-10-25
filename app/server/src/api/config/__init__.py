# pylint: disable=too-few-public-methods
from logging import INFO
from os import environ

from dotenv import load_dotenv
from sqlalchemy.engine.url import URL

from ..cognito.user import UserInfo


load_dotenv()


def _concat(delimiter: str, *values: str) -> str:
    return delimiter.join(filter(None, values))


class Config:
    """
    The base configuration object.
    """

    APP_NAME = environ.get("APP_NAME", "")
    """
    The unique name of the application taken from the `/aws/cfn-template-configuration-*.json`.

    Notes:
        - Unset on the AWS.
        - Might be unset on some versions of the local environment.
    """

    # Flask app configuration.
    ENV = "production"
    FLASK_ENV = "production"
    DEBUG = False
    TESTING = False
    SECRET_KEY = environ.get("SECRET_KEY", "")
    PERMANENT_STORAGE = "/mnt/shared"

    # Logging configuration.
    LOGGING_LEVEL = INFO

    # Security configuration.
    SESSION_COOKIE_NAME = "session"
    SESSION_COOKIE_NAME_AUTH = "auth"
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"

    # Cache configuration.
    CACHE_TYPE = "flask_caching.backends.FileSystemCache"
    CACHE_DIR = f"{PERMANENT_STORAGE}/cache"

    # Database connection.
    # Fix deprecated engine name @see https://github.com/sqlalchemy/sqlalchemy/issues/6083
    DATABASE_ENGINE = environ.get("DATABASE_ENGINE", "").replace("postgres", "postgresql")
    DATABASE_HOST = environ.get("DATABASE_HOST")
    DATABASE_PORT = int(environ.get("DATABASE_PORT", 0))
    DATABASE_NAME = environ.get("DATABASE_NAME")
    DATABASE_USER = environ.get("DATABASE_USER")
    DATABASE_PASSWORD = environ.get("DATABASE_PASSWORD")
    # Using the `URL.create` instead of the plain string like `ENGINE://USER:PASSWORD@HOST:PORT/DB`
    # as the password might contain the special characters that have to be properly escaped.
    SQLALCHEMY_DATABASE_URI = URL.create(
        drivername=DATABASE_ENGINE,
        username=DATABASE_USER,
        password=DATABASE_PASSWORD,
        host=DATABASE_HOST,
        port=DATABASE_PORT,
        database=DATABASE_NAME,
    )

    # Cognito configuration for SSO.
    AWS_COGNITO_DISABLED = False
    AWS_COGNITO_OPEN_REGISTRATION = True
    AWS_REGION = environ.get("AWS_REGION")
    AWS_COGNITO_USER_POOL_ID = environ.get("AWS_COGNITO_USER_POOL_ID")
    AWS_COGNITO_DOMAIN = environ.get("AWS_COGNITO_DOMAIN")
    AWS_COGNITO_USER_POOL_CLIENT_ID = environ.get("AWS_COGNITO_USER_POOL_CLIENT_ID")
    AWS_COGNITO_USER_POOL_CLIENT_SECRET = environ.get("AWS_COGNITO_USER_POOL_CLIENT_SECRET")
    AWS_COGNITO_COOKIE_AGE_SECONDS = int(environ.get("AWS_COGNITO_COOKIE_AGE_SECONDS", 3600))
    AWS_COGNITO_REFRESH_FLOW_ENABLED = True
    AWS_COGNITO_REFRESH_COOKIE_ENCRYPTED = True
    AWS_COGNITO_REFRESH_COOKIE_AGE_SECONDS = 86400

    # Uploads configuration.
    UPLOAD_FOLDER = f"{PERMANENT_STORAGE}/uploads"
    ALLOWED_EXTENSIONS = {"pdf"}
    MAX_CONTENT_LENGTH = 32 * 1024 * 1024

    ADMIN_USERS: tuple[str, ...] = tuple(
        # Using set to make the tuple of unique values.
        set(
            map(
                lambda email: email.strip().lower(),
                (
                    *environ.get("ADMIN_USERS", "").split(","),
                    # The static list of emails goes below. Please note
                    # the below users will become administrators on all
                    # application environments! Keep it narrow!
                    "JeremySD99@gmail.com",
                ),
            ),
        ),
    )
    """
    The list of SSO emails of those who should be made an admin.

    Use `ADMIN_USERS="jon.doe@gmail.com,jane.doe@gmail.com"` environment
    variable to configure the list on a per-environment basis or provide
    the static list of admins.
    """


class DevConfig(Config):
    """
    The configuration object for the `local` environment.
    """

    # Flask app configuration.
    ENV = "development"
    FLASK_ENV = "development"
    DEBUG = True
    PERMANENT_STORAGE = "./src/instance"

    # Cache configuration.
    CACHE_DIR = f"{PERMANENT_STORAGE}/cache"

    # Uploads configuration.
    UPLOAD_FOLDER = f"{PERMANENT_STORAGE}/uploads"

    # Allows visiting `/api/auth/cognito/fake` to auth without the SSO.
    AWS_COGNITO_DISABLED = bool(environ.get("AWS_COGNITO_DISABLED"))

    SESSION_COOKIE_NAME = _concat("-", Config.APP_NAME, Config.SESSION_COOKIE_NAME)
    """
    The cookie name must be unique as all projects are on `127.0.0.1`.
    """

    SESSION_COOKIE_NAME_AUTH = _concat("-", Config.APP_NAME, Config.SESSION_COOKIE_NAME_AUTH)
    """
    The cookie name must be unique as all projects are on `127.0.0.1`.
    """

    SESSION_COOKIE_SECURE = False
    """
    Do not require secure session cookies locally.

    This allows working in an insecure HTTP context leveraging
    Cognito auth on `localhost` from aliases of the `127.0.0.1`.

    By default, `localhost` and `127.0.0.1` are considered secure
    by most of the browsers thus having this set to `True` works
    when someone accesses the project via http://localhost:8000.
    However, there might be the case when there is an alias for
    the `127.0.0.1`, e.g. `127.0.0.1 my-laptop` in `/etc/hosts`.
    Opening the http://my-laptop:8000 will show the app however
    the auth won't work due to the cookie's `Secure` parameter
    that requires the HTTPS connection.

    Although the aforementioned scenario seem made up, there is
    a real use case when multiple developers work on the project
    on their machines being in the same local network at the same
    time. Consider Rob and Joe are both in the lab in front of
    their computers that have `rob-pc` and `joe-pc` hostnames in
    the LAN. Joe can visit http://rob-pc:8000 as well as Rob can
    http://joe-pc:8000.
    """

    FAKE_USER_INFO: UserInfo = {
        "email": "jon.doe+unknown@gmail.com",
        "custom:ntid": "jdoe77",
        "name": "Jon",
        "family_name": "Doe",
    }
    """
    The fake user account that is automatically created
    on login when the `AWS_COGNITO_DISABLED` is `True`.
    """

    ADMIN_USERS: tuple[str, ...] = (
        *Config.ADMIN_USERS,
        # Make the fake user an admin.
        FAKE_USER_INFO["email"],
    )


class StageConfig(Config):
    """
    The configuration object for the `stage` environment.
    """


class UatConfig(Config):
    """
    The configuration object for the `uat` environment.
    """


class ProdConfig(Config):
    """
    The configuration object for the `prod` environment.
    """
