from http import HTTPStatus

from flask_restful import Resource
from api.principal import authentication_required
from api.restful.restful_api import resource


@resource("/example/data", endpoint="example")
class ExampleResource(Resource):
    """An example resource."""

    @authentication_required()
    def get(self) -> tuple[dict[str, str], int]:
        example_data = {
            "key1": "value1",
            "key2": "value2",
            "key3": "value3",
        }
        return example_data, HTTPStatus.OK
