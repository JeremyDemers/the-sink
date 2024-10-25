from dataclasses import dataclass

from marshmallow import Schema

from api.schema.dict_defaults import DictDefaults


def test_dict_defaults() -> None:
    class TestSchema(Schema):
        """
        Noop.
        """

        data = DictDefaults(
            {
                "title": "Default Value",
            },
        )

    @dataclass
    class TestObject:
        """
        Noop.
        """

        data: dict

    values = TestSchema().dump(
        TestObject(
            data={},
        ),
    )

    assert isinstance(values, dict)
    assert values == {"data": {"title": "Default Value"}}
