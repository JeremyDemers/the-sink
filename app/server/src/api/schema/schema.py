from typing import Any, Final

from marshmallow import Schema as SchemaBase, ValidationError, EXCLUDE


_EMPTY_VALUES = (None, "")


class Schema(SchemaBase):
    """
    The Marshmallow Schema extension that supports checking value permanency
    with `.load(data, container=dict | object)`.

    Example:
        >>> from marshmallow import fields
        >>>
        >>>
        >>> class MySchema(Schema):
        >>>     email = fields.Email(
        >>>         metadata={
        >>>             # Allow setting the value but not updating it.
        >>>             # The value is considered empty if it's `None`
        >>>             # or `""` (an empty string).
        >>>             "permanent": True,
        >>>         },
        >>>     )
        >>>
        >>>
        >>> my_schema = MySchema()
        >>>
        >>> # Returns `{"email": "abc@gmail.com"}`.
        >>> my_schema.load(
        >>>     {"email": "abc@gmail.com"},
        >>>     container={},
        >>> )
        >>>
        >>> # Returns `{"email": "abc@gmail.com"}`.
        >>> my_schema.load(
        >>>     {"email": "abc@gmail.com"},
        >>>     container={"email": "abc@gmail.com"},
        >>> )
        >>>
        >>> # Returns `{"email": "abc@gmail.com"}`.
        >>> my_schema.load(
        >>>     {"email": "abc@gmail.com"},
        >>>     container={"email": ""},
        >>> )
        >>>
        >>> # Raises `ValidationError`.
        >>> my_schema.load(
        >>>     {"email": "abc@gmail.com"},
        >>>     container={"email": "test@gmail.com"},
        >>> )
    """

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        kwargs.setdefault("unknown", EXCLUDE)
        super().__init__(*args, **kwargs)

        permanent_fields: set[str] = set()

        for name, item in self.declared_fields.items():
            permanent = item.metadata.get("permanent")
            assert permanent is None or permanent is True, name
            if permanent is True:
                permanent_fields.add(name)

        self.permanent_fields: Final[tuple[str, ...]] = tuple(sorted(permanent_fields))

    def load(self, *args: Any, **kwargs: Any) -> Any:
        container = kwargs.pop("container", None)
        assert container is None or isinstance(container, (dict, object))
        data = super().load(*args, **kwargs)

        if container:
            getter = dict.get if isinstance(container, dict) else getattr
            for key_permanent in self.permanent_fields:
                value_current = getter(container, key_permanent, None)  # type: ignore
                value_new = data.get(key_permanent, None)

                if (
                    value_new is not None
                    and value_current not in _EMPTY_VALUES
                    and value_new != value_current
                ):
                    raise ValidationError(
                        message={
                            key_permanent: "The field value cannot be changed.",
                        },
                        field_name=key_permanent,
                        data=data,
                    )

        return data


__all__ = [
    "Schema",
]
