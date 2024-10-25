from inspect import getmembers_static, isabstract, isclass
from sys import modules
from typing import TypeAlias

from flask import current_app

from .operation import Operations, HasOperations, Permission
from .role import Role


_Actions: TypeAlias = dict[Permission, set]
_ActionsByRole: TypeAlias = dict[Role, _Actions]
_Constraints: TypeAlias = set[Operations]

_actions_by_role: _ActionsByRole = {}
_constraints: _Constraints = set()


def _get_constraints() -> _Constraints:
    """
    :return: The list of unique constrains defined by the various
     classes that extends the `HasOperations` class.
    """
    items: _Constraints = set()

    for _, module in modules.items():
        for _, member in getmembers_static(module):
            if (
                isclass(member)
                and not isabstract(member)
                and issubclass(member, HasOperations)
                and hasattr(member, "can_be")
            ):
                items.add(member.can_be)

    return items


def _get_actions_mapping(constraints: _Constraints) -> _ActionsByRole:
    """
    :param constraints: The list of known constraints.
    :return: The dictionary where the key is a role and the value is
     another dictionary keyed by the permission with the value being
     a set of needs that correspond to the permission.
    """
    mapping: _ActionsByRole = {}

    for item in constraints:
        for can in item:
            for user_role in can.roles:
                mapping.setdefault(user_role, {})
                mapping[user_role].setdefault(can.permission, set())
                mapping[user_role][can.permission].update(can.needs)

    return mapping


def get_actions(role: Role) -> _Actions:
    """
    :param role: The user role.
    :return: A dictionary where the key is a permission and a value
     is a set of needs that correspond to the permission.

    Examples:
        - Get the list of needs.
        >>> get_actions(Role.ADMIN).values()

        - Get the list of permissions:
        >>> get_actions(Role.ADMIN).keys()
    """
    # Seek accessible objects in Python modules in the dev-mode
    # as it's not possible to know when such an object is added
    # or deleted.
    if current_app.debug:
        _constraints.clear()
        _actions_by_role.clear()

    # Collect accessible objects once. This is intentionally
    # done here as a deferred operation to let Flask fully
    # boot and have all Python modules loaded.
    if not _constraints:
        _constraints.update(_get_constraints())
        _actions_by_role.update(_get_actions_mapping(_constraints))

    actions = _actions_by_role.get(role, {})

    # Every user is authenticated and hence they can hold
    # just one role, the actions of the `authenticated`
    # role must be added.
    if role != Role.AUTHENTICATED:
        return {
            **actions,
            **_actions_by_role.get(Role.AUTHENTICATED, {}),
        }

    return actions


__all__ = [
    "get_actions",
]
