from dataclasses import dataclass
from typing import Any, Callable, ClassVar, Final, Self

from flask import current_app
from flask_login import current_user
from marshmallow import fields
from sqlalchemy.orm import Mapped
from sqlalchemy.exc import SQLAlchemyError

from api.database import db
from api.principal.operation import Operation, Operations, HasOperations
from api.schema import Schema
from .has_timestamps import HasTimestamps, HasTimestampsSchema


@dataclass(frozen=True)
class EntitySchema:
    """
    The entity schemas container.
    """

    item: Schema
    """
    The schema to serialize/validate a model.

    Utilized for:
        - transforming an entity instance into a JSON to serve for REST API requests;
        - validating an inbound HTTP JSON `POST`/`PUT` requests for creating/updating
          an entity.
    """

    list_item: Schema | None = None
    """
    The optional schema to serialize a model that is served in list REST API responses.

    The `item` is used if not set.
    """

    def serialize(self, model: "EntityMixin", list_item: bool = False) -> dict:
        """
        :param model: The model to serialize.
        :param list_item: The state of whether the `list_item` schema should be
         used for serialization.
        :return: The serialized `model`.
        """
        data = self.get(list_item=list_item).dump(model)
        assert isinstance(data, dict)

        return data

    def get(self, list_item: bool = False) -> Schema:
        """
        :param list_item: The state of whether the `list_item` schema should be
         used for serialization.
        :return: The existing schema instance.
        """
        return (self.list_item if list_item else None) or self.item


class EntityOperations(Operations):  # pylint: disable=locally-disabled, too-few-public-methods
    """
    Defines the well-known entity operations.
    """

    def __init__(self, slug: str) -> None:
        self.viewed: Final[Operation] = Operation(f"view {slug}")
        self.edited: Final[Operation] = Operation(f"edit {slug}")
        self.created: Final[Operation] = Operation(f"create {slug}")
        self.deleted: Final[Operation] = Operation(f"delete {slug}")


class EntityMixin(HasTimestamps, HasOperations[EntityOperations]):
    """
    The base entity model.
    """

    __abstract__ = True

    schema: ClassVar[EntitySchema]

    id: Mapped[int] = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True,
    )

    if __debug__:
        # Defining the `__init__` only in dev mode to ensure the
        # model configuration is appropriate.
        def __init__(self, *args: Any, **kwargs: Any) -> None:
            assert isinstance(self.__class__.schema, EntitySchema)
            super().__init__(*args, **kwargs)

    def get_label(self) -> str:
        """
        Returns the label that represents an entity.

        The uniqueness is not required.

        For instance: consider a `User` model that has the `name`
        field. It's possible to have many `Jon Doe` in the system
        and exactly this field is a good candidate to be a label.
        """
        raise NotImplementedError

    def to_json(self, list_item: bool = False) -> dict:
        return self.schema.serialize(
            model=self,
            list_item=list_item,
        )

    @classmethod
    def get(cls, pk: int | str) -> Self | None:
        return cls.query.get(  # type: ignore[no-any-return]
            cls._normalize_pk(pk),
        )

    @classmethod
    def get_or_404(cls, pk: int | str, description: str | None = None) -> Self:
        return cls.query.get_or_404(  # type: ignore[no-any-return]
            cls._normalize_pk(pk),
            description,
        )

    def safe_session_execute_or_rollback(self, fn: Callable[[Self], None]) -> None:
        """
        Safely execute database commit, rollbacks database transaction in case of failure.

        @link https://docs.sqlalchemy.org/en/13/faq/sessions.html
        :param fn: callback that will be executed before transaction commit.
        """
        try:
            fn(self)
            db.session.commit()
        except SQLAlchemyError as error:
            db.session.rollback()
            raise error

    def save(self, skip_log: bool = False) -> Self:
        """Save entity model to the database"""
        is_new = self.id is None

        self.safe_session_execute_or_rollback(db.session.add)

        if not skip_log:
            current_app.logger.info(self.get_log_message("created" if is_new else "updated"))

        return self

    def delete(self) -> Self:
        """Delete entity model from the database"""

        self.safe_session_execute_or_rollback(db.session.delete)

        current_app.logger.info(self.get_log_message("deleted"))

        return self

    def get_log_message(self, action: str) -> str:
        return (
            f"{self.__class__.__name__} {self.format_label()} has "
            f"been {action} by {self.format_current_user_email()}"
        )

    @staticmethod
    def format_current_user_email() -> str:
        """Format current logged-in user email address."""
        return str(
            current_user.email
            if current_user and current_user.is_authenticated
            else "Anonymous User"
        )

    def format_label(self) -> str:
        """Format model label."""
        return f'"{self.get_label()}"[{self.id}]'

    @staticmethod
    def _normalize_pk(pk: int | str) -> int:
        if not isinstance(pk, int):
            assert pk.isdigit()
            pk = int(pk)

        assert pk > 0
        return pk


class EntityMixinSchema(HasTimestampsSchema):
    """
    The base entity model schema.
    """

    id = fields.Int(
        # The primary key is autogenerated and cannot be changed.
        dump_only=True,
    )


__all__ = [
    "EntityMixin",
    "EntitySchema",
    "EntityOperations",
    "EntityMixinSchema",
]
