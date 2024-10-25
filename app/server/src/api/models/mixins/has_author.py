from flask import current_app
from flask_login import current_user
from marshmallow import fields
from sqlalchemy.orm import Mapped
from sqlalchemy.ext.declarative import declared_attr

from api.database import db, Model
from api.schema import Schema

from ..user import User


def _get_current_user_id() -> int | None:
    with current_app.app_context():
        if current_user and current_user.is_authenticated:
            return int(current_user.id)

    return None


# pylint: disable=too-few-public-methods
class HasAuthor(Model):  # type: ignore[name-defined]
    """
    Adds the `author_id` column to the model.
    """

    __abstract__ = True

    __backref_user__: str | None = ":auto:"
    """
    The name of a property on the `User` entity that allows accessing
    the list of entities of this mixin's type. When set to `:auto:`,
    the property name is automatically generated based on a class name.

    Example:

        >>> class Lab(EntityMixinSchema, HasAuthorSchema):
        >>>    pass
        >>>
        >>> # The `Lab` is lowercased with appended `s`.
        >>> user.labs

    In case the backref is unnecessary, override the field and set it
    to `None`.
    """

    # noinspection PyNestedDecorators
    @declared_attr
    @classmethod
    def author_id(cls) -> Mapped[int]:
        return db.Column(  # type: ignore[no-any-return]
            db.Integer,
            db.ForeignKey("user.id"),
            default=_get_current_user_id,
        )

    # noinspection PyNestedDecorators
    @declared_attr
    @classmethod
    def author(cls):  # type: ignore[no-untyped-def]
        relation = "User"

        if not cls.__backref_user__:
            return db.relationship(relation)

        if cls.__backref_user__ == ":auto:":
            # Naive pluralization. Override `__backref_user__`
            # to set the value that fits best.
            ref_name = f"{cls.__name__.lower()}s"
        else:
            ref_name = cls.__backref_user__

        return db.relationship(
            relation,
            backref=db.backref(
                ref_name,
                lazy=True,
            ),
        )


# pylint: enable=too-few-public-methods


class HasAuthorSchema(Schema):
    """
    The schema with the `author` column.
    """

    author_id = fields.Int(
        # Automatically used by the `author` column. Unavailable on serialization.
        load_only=True,
        # The value is maintained by the app thus closed for changes via HTTP API.
        dump_only=True,
    )

    author = fields.Nested(
        User.schema.item.__class__(only=("name", "id")),
        # The value is maintained by the app thus closed for changes via HTTP API.
        dump_only=True,
    )


__all__ = [
    "HasAuthor",
    "HasAuthorSchema",
]
