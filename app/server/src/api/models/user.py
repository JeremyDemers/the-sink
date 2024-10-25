from enum import verify, UNIQUE, CONTINUOUS, IntEnum

from flask_login import UserMixin
from marshmallow import fields, validate
from sqlalchemy.orm import Mapped

from api.database import db
from api.models.mixins.entity import EntityMixin, EntityOperations, EntityMixinSchema, EntitySchema
from api.principal.role import Role


class ModelOperations(EntityOperations):  # pylint: disable=locally-disabled, too-few-public-methods
    """
    Defines the following permissions:
        - `create users`
        - `view users`
        - `edit users`
        - `delete users`
    """

    def __init__(self) -> None:
        super().__init__("users")

        self.created.by(Role.ADMIN)
        self.viewed.by(Role.ADMIN)
        self.edited.by(Role.ADMIN)
        self.deleted.by(Role.ADMIN)


@verify(UNIQUE, CONTINUOUS)
class UserStatus(IntEnum):
    """
    The statuses of a user.
    """

    BLOCKED = 0
    ACTIVE = 1


class UserListSchema(EntityMixinSchema):
    """User list schema"""

    name = fields.Str(
        # The field is populated on login and cannot be updated.
        dump_only=True,
    )

    email = fields.Email(
        # The field could have been a `dump_only` however that
        # prevents creating accounts from the UI. The `permanent`
        # instruction allows setting the value via HTTP API but
        # forbids changes.
        metadata={
            "permanent": True,
        },
    )

    role = fields.Int(
        # Allow a stringified version.
        strict=False,
        validate=validate.OneOf([role.value for role in Role]),
    )

    is_active = fields.Boolean(
        # The property is computed.
        dump_only=True,
    )


class UserSchema(UserListSchema):
    """User schema"""

    status = fields.Int(
        validate=validate.OneOf([status.value for status in UserStatus]),
    )


class User(EntityMixin, UserMixin):
    """User ORM model"""

    can_be = ModelOperations()

    schema = EntitySchema(
        item=UserSchema(),
        list_item=UserListSchema(),
    )

    name: Mapped[str | None] = db.Column(
        db.String,
        nullable=True,
    )

    ntid: Mapped[str | None] = db.Column(
        db.String,
        unique=True,
        nullable=True,
    )

    email: Mapped[str] = db.Column(
        db.String,
        unique=True,
        nullable=False,
    )

    role: Mapped[int] = db.Column(
        db.Integer,
        server_default=str(Role.AUTHENTICATED.value),
        nullable=False,
    )

    status: Mapped[int] = db.Column(
        db.Integer,
        server_default=str(UserStatus.ACTIVE.value),
        nullable=False,
    )

    @property
    def is_active(self) -> bool:
        return int(self.status) == UserStatus.ACTIVE.value

    def get_label(self) -> str:
        return str(self.email)


__all__ = [
    "User",
    "UserStatus",
]
