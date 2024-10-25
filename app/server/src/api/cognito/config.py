from flask import url_for
from flask_cognito_lib.config import Config


class CognitoConfig(Config):
    """
    The Cognito config.
    """

    @property
    def redirect_url(self) -> str:
        """
        Return the redirect URL for `post-login`.
        """
        return url_for(endpoint="auth.cognito", _external=True)

    @property
    def logout_redirect(self) -> str:
        """
        Returns the redirect URL for `post-logout`.
        """
        return url_for(endpoint="auth.cognito_post_logout", _external=True)


__all__ = [
    "CognitoConfig",
]
