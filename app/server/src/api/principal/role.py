from enum import verify, UNIQUE, CONTINUOUS, IntEnum


@verify(UNIQUE, CONTINUOUS)
class Role(IntEnum):
    """
    The user roles known to the system.
    """

    ADMIN = 1

    SCIENTIST = 2

    AUTHENTICATED = 3


__all__ = [
    "Role",
]
