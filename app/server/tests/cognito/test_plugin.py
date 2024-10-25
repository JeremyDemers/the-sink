from flask import Flask

from api.blueprints.auth import auth_bp

from api.cognito import Cognito
from api.cognito.config import CognitoConfig


def test_init_app() -> None:
    cognito = Cognito()
    assert not hasattr(cognito, "cfg")

    app = Flask(import_name="test1")
    app.config["SERVER_NAME"] = "localhost"
    app.config["APPLICATION_ROOT"] = "/"
    app.config["PREFERRED_URL_SCHEME"] = "http"
    app.register_blueprint(auth_bp)

    cognito.init_app(app)
    assert isinstance(cognito.cfg, CognitoConfig)

    with app.app_context():
        assert cognito.cfg.redirect_url == "http://localhost/auth/cognito"
        assert cognito.cfg.logout_redirect == "http://localhost/auth/cognito/post-logout"
