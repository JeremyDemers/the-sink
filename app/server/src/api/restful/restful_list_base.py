from abc import ABC
from http import HTTPStatus
from typing import Any, Callable, Literal, TypedDict

from flask import request
from flask_sqlalchemy.query import Query
from sqlalchemy import func
from sqlalchemy.orm import aliased

from api.models.user import User
from api.models.mixins.has_author import HasAuthor
from api.models.mixins.has_timestamps import HasTimestamps
from api.principal import authentication_required

from .restful_api import EntityResource, _Entity


QueryArgs = int | str | list[str] | list[int]
QueryFn = Callable[[Query, QueryArgs], Query]
Queries = dict[str, QueryFn]
SortOrder = Literal["asc", "desc"]


class DefaultSort(TypedDict):
    """Route permissions object"""

    sort: str
    direction: SortOrder


class RestfulListBase(EntityResource[_Entity], ABC):
    """
    Entity's list item base resource.
    """

    default_sort: DefaultSort = {
        "sort": "created_at",
        "direction": "desc",
    }

    def __init__(self) -> None:
        super().__init__()
        self.query: Query = self.model.query

        self._filters: Queries = {}
        self._sorting: Queries = {}

        if issubclass(self.model, HasAuthor):
            user_alias = aliased(User)  # type: ignore[unreachable]
            self._filters["author_name"] = lambda q, s: q.join(user_alias).filter(
                user_alias.name.ilike(f"%{s}%"),
            )
            self._sorting["author_name"] = lambda q, s: q.join(user_alias).order_by(
                user_alias.name.desc() if s == "desc" else user_alias.name.asc(),
            )

        if issubclass(self.model, HasTimestamps):
            self._filters["created_from"] = lambda q, s: q.filter(
                func.date(self.model.created_at) >= s,
            )
            self._filters["created_to"] = lambda q, s: q.filter(
                func.date(self.model.created_at) <= s,
            )
            self._filters["updated_from"] = lambda q, s: q.filter(
                func.date(self.model.updated_at) >= s,
            )
            self._filters["updated_to"] = lambda q, s: q.filter(
                func.date(self.model.updated_at) <= s,
            )

    @authentication_required()
    def get(self) -> tuple[dict[str, Any], int]:
        """Returns sorted and filtered entity list."""
        if not self.model.can_be.viewed:
            return {"message": "Access denied"}, HTTPStatus.FORBIDDEN

        try:
            self.apply_filters()
            self.apply_sorting()
        except ValueError as error:
            return {"message": str(error)}, 500

        paginated_entities = self.query.paginate(
            page=request.args.get("page", 1, type=int),
            per_page=request.args.get("per_page", 10, type=int),
            error_out=False,
        )

        sort, sort_direction = self.get_sort_and_direction()

        return {
            "items": tuple(
                map(
                    lambda item: item.to_json(list_item=True),
                    paginated_entities.items,
                ),
            ),
            "pager": {
                "total": paginated_entities.total,
                "page": paginated_entities.page,
                "per_page": paginated_entities.per_page,
            },
            "sort": [
                {
                    "id": sort,
                    "desc": sort_direction == "desc",
                },
            ],
            "filters": self.get_filters(),
        }, HTTPStatus.OK

    def apply_filters(self) -> None:
        """Apply filters"""

        filters = self.get_filters()
        special_filters = {**self._filters, **self.get_special_filters()}

        for filter_key, filter_value in filters.items():
            attribute = filter_key.replace("_filter", "")

            if attribute in special_filters:
                self.query = special_filters[attribute](
                    self.query,
                    filter_value,
                )
            elif hasattr(self.model, attribute):
                self.query = self.query.filter(
                    getattr(self.model, attribute).ilike(f"%{filter_value}%"),
                )
            else:
                raise ValueError(f"{filter_key} filter is not supported")

    def apply_sorting(self) -> None:
        """Apply sorting"""

        sort, sort_direction = self.get_sort_and_direction()

        if sort_direction is not None and sort is not None:
            if sort_direction not in ["asc", "desc"]:
                raise ValueError(f"{sort_direction} sort order is not supported")

            special_sorting = {**self._sorting, **self.get_special_sorting()}

            if sort in special_sorting:
                self.query = special_sorting[sort](
                    self.query,
                    sort_direction,
                )
            elif hasattr(self.model, sort):
                sort_column = getattr(self.model, sort)
                self.query = self.query.order_by(
                    getattr(sort_column, sort_direction)(),
                )
            else:
                raise ValueError(f"{sort} sort is not supported")

    def get_sort_and_direction(self) -> tuple[str | None, SortOrder | None]:
        """Get sort and direction strings"""
        default_sort, default_direction = None, None

        if self.default_sort:
            default_sort = self.default_sort["sort"]
            default_direction = self.default_sort["direction"]

        sort = request.args.get("sort", default_sort)
        direction = request.args.get("order", default_direction)

        return sort, direction

    @staticmethod
    def get_default_filters() -> dict[str, QueryArgs]:
        """Get default filters"""
        return {}

    def get_filters(self) -> dict[str, QueryArgs]:
        filters = self.get_default_filters()

        filters.update(
            {key: value for key, value in request.args.items() if key.endswith("_filter")}
        )

        return filters

    def get_special_filters(self) -> Queries:
        """Get special filters"""
        return {}

    def get_special_sorting(self) -> Queries:
        """Get special sorting"""
        return {}
