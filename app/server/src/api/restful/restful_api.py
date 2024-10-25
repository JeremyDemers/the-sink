from abc import ABC
from http import HTTPStatus
from typing import Any, Callable, Final, Generic, TypeAlias, TypeVar

from flask_restful import Api, Resource

from api.models.mixins.entity import EntityMixin


_Entity = TypeVar("_Entity", bound=EntityMixin)
_Resource = TypeVar("_Resource", bound=Resource)

JsonResponse: TypeAlias = tuple[dict, HTTPStatus]

# Initialization of the API has been moved from __init__ in order to define
# resource decorator, before the actual resource definition import, otherwise
# restful resources wouldn't be registered.
restful = Api()


def resource(*urls: str, **kwargs: Any) -> Callable[[_Resource], _Resource]:
    """
    Decorator to add a resource to the RESTful API.

    Parameters
    ----------
    urls
        The urls for the resource.
    kwargs
        Keyword arguments that should be proxied to restful.add_resource

    Returns
    -------
    cls: The decorated class.
    """

    def decorator(cls: _Resource) -> _Resource:
        restful.add_resource(cls, *urls, **kwargs)
        return cls

    return decorator


class EntityResource(Generic[_Entity], Resource, ABC):
    """
    The generic entity-aware REST resource.
    """

    denied_response: JsonResponse = (
        {
            "message": "Access denied",
        },
        HTTPStatus.FORBIDDEN,
    )

    def __init__(self) -> None:
        # The `__orig_bases__` is introduced since 3.7 in PEP-560.
        # See https://peps.python.org/pep-0560/
        # The `[0]` here is the `Generic` that has a `[0]` argument
        # that must be of `type[EntityMixin]`.
        #
        # noinspection PyUnresolvedReferences
        # pylint: disable=no-member
        self.model: Final[type[_Entity]] = self.__class__.__orig_bases__[0].__args__[0]
        # pylint: enable=no-member
        assert issubclass(self.model, EntityMixin)


__all__ = [
    "restful",
    "resource",
    "EntityResource",
    "JsonResponse",
    "_Entity",
]
