from os import environ, makedirs

from flask import Flask
from werkzeug.middleware.proxy_fix import ProxyFix

from api.blueprints.auth import auth_bp
from api.blueprints.db_commands import db_commands_bp
from api.auth import login_manager
from api.cache import cache
from api.cognito import cognito
from api.cors import cors
from api.database import db, migrate
from api.restful import restful
from api.principal import principal


def create_app(test_config: dict | None = None) -> Flask:
    app = Flask(__name__, instance_relative_config=True)

    if test_config is None:
        # Load configuration class matching the APP_ENV, when not testing.
        # Example: `DevConfig`, `StageConfig`.
        app_env = environ.get("APP_ENV", "dev").title()
        app.config.from_object(f"api.config.{app_env}Config")
        # Set up the application's log level.
        if not app.config["DEBUG"]:
            app.logger.setLevel(app.config["LOGGING_LEVEL"])
    else:
        # Load the test config if passed in.
        app.config.from_mapping(test_config)

    # Ensure the instance folder exists.
    try:
        makedirs(app.instance_path)
    except OSError:
        pass

    # Ensure the upload, and cache folders exists.
    if app.config["TESTING"] is False:
        try:
            makedirs(app.config["UPLOAD_FOLDER"])
        except OSError:
            pass

        try:
            makedirs(app.config["CACHE_DIR"])
        except OSError:
            pass

    cors.init_app(app)
    db.init_app(app)
    migrate.init_app(app)
    login_manager.init_app(app)
    cache.init_app(app)
    cognito.init_app(app)
    restful.init_app(app)
    principal.init_app(app)

    # Ensure the app will trust the proxy headers.
    app.wsgi_app = ProxyFix(  # type: ignore[method-assign]
        app.wsgi_app,
        x_for=1,
        x_proto=1,
        x_host=1,
        x_port=1,
        x_prefix=1,
    )

    # Register cli commands blueprint.
    app.register_blueprint(db_commands_bp)

    # Register the authentication blueprint.
    app.register_blueprint(auth_bp)

    return app
