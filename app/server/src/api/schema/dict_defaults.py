from typing import Any, Generic, Mapping, TypeVar

from marshmallow import fields


_T = TypeVar("_T", bound=dict | Mapping)


class DictDefaults(Generic[_T], fields.Dict):
    """
    The `Dict` schema that ensures all required values are present.

    Example:
        >>> from typing import TypedDict
        >>>
        >>> from marshmallow import Schema
        >>>
        >>>
        >>> class MyData(TypedDict):
        >>>     title: str
        >>>
        >>>
        >>> MyDataEmpty = MyData(
        >>>     title="",
        >>> )
        >>>
        >>> class MySchema(Schema):
        >>>     data = DictDefaults(MyDataEmpty)
    """

    def __init__(self, defaults: _T, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self._defaults = defaults

    def serialize(self, *args: Any, **kwargs: Any) -> Any:
        data = super().serialize(*args, **kwargs)

        if isinstance(data, dict):
            # Ensure the default values of the newly introduced items
            # are added to the API response so the form on the client
            # side doesn't error.
            for key, value in self._defaults.items():
                data.setdefault(key, value)

        return data


__all__ = [
    "DictDefaults",
]
