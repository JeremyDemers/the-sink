from typing import Final, Generator, Generic, Self, TypeAlias, TypeVar

from flask_principal import Permission as PermissionConstraint, ActionNeed

from .role import Role


Permission: TypeAlias = str


class Operation(PermissionConstraint):
    """
    The operation that requires a user's permission.
    """

    def __init__(self, permission: Permission) -> None:
        super().__init__(ActionNeed(permission))
        self.permission: Final[Permission] = permission
        self.roles: set[Role] = set()

    def by(self, *role: Role) -> Self:
        self.roles.update(role)

        return self

    def __str__(self) -> Permission:
        return self.permission


class Operations:  # pylint: disable=locally-disabled, too-few-public-methods
    """
    The operations' collection.
    """

    def __iter__(self) -> Generator[Operation, None, None]:
        for name in vars(self):
            attr = getattr(self, name)

            if isinstance(attr, Operation):
                yield attr


_O = TypeVar("_O", bound=Operations)


class HasOperations(Generic[_O]):  # pylint: disable=locally-disabled, too-few-public-methods
    """
    The target class that requires permissions for its operations
    must extend this one. All children are automatically discovered.
    """

    can_be: _O


__all__ = [
    "Permission",
    "Operation",
    "Operations",
    "HasOperations",
]
