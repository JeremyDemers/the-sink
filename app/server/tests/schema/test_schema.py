from types import SimpleNamespace

from marshmallow import fields, ValidationError
from pytest import mark, raises

from api.schema import Schema


@mark.parametrize(
    ("cast",),
    (
        (dict,),
        (SimpleNamespace,),
    ),
)
def test_permanent(cast: type) -> None:
    class _Schema(Schema):
        text = fields.Str(
            metadata={
                "permanent": True,
            },
        )

    data = {"text": "abc"}
    schema = _Schema()
    assert schema.permanent_fields == ("text",)

    assert schema.load(data, container=cast()) == data
    assert schema.load(data, container=cast(text="")) == data
    assert schema.load(data, container=cast(text=None)) == data

    with raises(ValidationError) as error:
        assert schema.load(data, container=cast(text="b"))
    assert isinstance(error.value, ValidationError)
    assert error.value.messages == {"text": "The field value cannot be changed."}
