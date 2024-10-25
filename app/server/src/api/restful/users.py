from http import HTTPStatus

from flask_login import current_user

from api.principal import authentication_required
from api.models.user import User, UserStatus

from .restful_api import EntityResource, JsonResponse, resource
from .restful_base import RestfulBase
from .restful_list_base import RestfulListBase, QueryArgs, Queries


@resource("/users")
class UserListResource(RestfulListBase[User]):
    """
    User's list item resource.
    """

    default_sort = {
        "sort": "name",
        "direction": "asc",
    }

    @staticmethod
    def get_default_filters() -> dict[str, QueryArgs]:
        return {
            "status_filter": UserStatus.ACTIVE.value,
        }

    def get_special_filters(self) -> Queries:
        return {
            "role": lambda q, s: q.filter(self.model.role == s),
            "status": lambda q, s: q.filter(self.model.status == s),
        }


@resource("/users", "/users/<int:entity_id>")
class UserResource(RestfulBase[User]):
    """User resource"""

    @authentication_required()
    def put(self, entity_id: int) -> JsonResponse:
        if current_user.id == entity_id:
            return {"message": "Users can't edit their own profiles"}, HTTPStatus.FORBIDDEN

        # Note: the type is ignored because MyPy doesn't see
        # it due to the use of the class-level decorators.
        return super().put(entity_id)  # type: ignore

    @authentication_required()
    def delete(self, entity_id: int) -> JsonResponse:
        if current_user.id == entity_id:
            return {"message": "Users can't delete their own profiles"}, HTTPStatus.FORBIDDEN

        # Note: the type is ignored because MyPy doesn't see
        # it due to the use of the class-level decorators.
        return super().delete(entity_id)  # type: ignore

    def _process_upsert_request(self, data: dict, entity: User | None) -> None:
        is_active = data.get("is_active", None)

        if is_active is not None:
            data["status"] = (UserStatus.ACTIVE if is_active else UserStatus.BLOCKED).value


@resource("/users/current")
class UserCurrentResource(EntityResource[User]):
    """Current user resource"""

    @authentication_required()
    def get(self) -> JsonResponse:
        return current_user.to_json(), HTTPStatus.OK
