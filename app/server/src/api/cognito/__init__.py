from flask import Flask
from flask_cognito_lib import CognitoAuth

from .config import CognitoConfig


class Cognito(CognitoAuth):
    """
    The Cognito auth implementation.
    """

    # noinspection PyMethodOverriding
    def init_app(  # pylint: disable=locally-disabled, arguments-differ
        self,
        app: Flask,
    ) -> None:
        super().init_app(app, cfg=CognitoConfig())


cognito = Cognito()


__all__ = [
    "cognito",
]
