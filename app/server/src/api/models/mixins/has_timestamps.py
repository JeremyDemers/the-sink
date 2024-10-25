# See https://github.com/sqlalchemy/sqlalchemy/issues/9189
# pylint: disable=not-callable
from typing import Any
from datetime import datetime

from marshmallow import fields
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped
from sqlalchemy.event import listens_for

from api.database import db, Model
from api.schema import Schema


# pylint: disable=too-few-public-methods
class HasTimestamps(Model):
    """
    Adds timestamp columns to the model.
    """

    __abstract__ = True

    created_at: Mapped[datetime] = (  # pylint: disable=locally-disabled, unsubscriptable-object
        db.Column(
            db.DateTime,
            default=func.now(),
            nullable=False,
        )
    )

    updated_at: Mapped[datetime] = db.Column(
        db.DateTime,
        default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


# pylint: enable=too-few-public-methods


class HasTimestampsSchema(Schema):
    """
    The schema with timestamp columns.
    """

    created_at = fields.DateTime(
        # The value is maintained by the app thus closed for changes via HTTP API.
        dump_only=True,
    )

    updated_at = fields.DateTime(
        # The value is maintained by the app thus closed for changes via HTTP API.
        dump_only=True,
    )


@listens_for(HasTimestamps, "before_update", named=True)
def _update_timestamps(_: Any, __: Any, target: HasTimestamps) -> None:
    target.updated_at = func.now()


__all__ = [
    "HasTimestamps",
    "HasTimestampsSchema",
]
