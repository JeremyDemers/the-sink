from abc import ABC
from http import HTTPStatus

from flask import request
from marshmallow import ValidationError

from api.principal import authentication_required

from .restful_api import EntityResource, JsonResponse, _Entity


class RestfulBase(EntityResource[_Entity], ABC):
    """
    Restful Base implementation.

    IMPORTANT! The following methods MUST exist and MUST NOT be renamed:
      - `get`
      - `post`
      - `put`
      - `delete`
    Flask fills `self.methods` based on the methods of the class hierarchy.
    The value is a `set` of uppercase HTTP verbs (matches the `Method` type).
    """

    @authentication_required()
    def get(self, entity_id: int) -> JsonResponse:
        """
        Retrieve an entity by ID.
        """
        if not self.model.can_be.viewed:
            return self.denied_response

        return self._serialize(
            entity=self.model.get_or_404(entity_id),
            status=HTTPStatus.OK,
        )

    @authentication_required()
    def post(self) -> JsonResponse:
        """
        Create a new entity.
        """
        if not self.model.can_be.created:
            return self.denied_response

        return self._serialize(
            entity=self._save(entity=None),
            status=HTTPStatus.CREATED,
        )

    @authentication_required()
    def put(self, entity_id: int) -> JsonResponse:
        """
        Update an entity by ID.
        """
        if not self.model.can_be.edited:
            return self.denied_response

        return self._serialize(
            entity=self._save(entity=self.model.get_or_404(entity_id)),
            status=HTTPStatus.OK,
        )

    @authentication_required()
    def delete(self, entity_id: int) -> JsonResponse:
        """
        Delete an entity by ID.
        """
        if not self.model.can_be.deleted:
            return self.denied_response

        self.model.get_or_404(entity_id).delete()
        return {"message": f"Entity has been deleted (PK: {entity_id})."}, HTTPStatus.OK

    def _save(self, entity: _Entity | None) -> _Entity | ValidationError:
        """
        Unpack an entity from the request and save it to the database.
        """
        try:
            data = request.get_json()
            assert isinstance(data, dict)
            # Process the data (might be mutated).
            self._process_upsert_request(data=data, entity=entity)
            # Build the validated dictionary.
            data = self.model.schema.item.load(data, container=entity)
        except ValidationError as error:
            return error

        if entity:
            for key in data:
                setattr(entity, key, data.get(key))
        else:
            entity = self.model(**data)

        assert isinstance(entity, self.model)
        return entity.save()

    def _process_upsert_request(self, data: dict, entity: _Entity | None) -> None:
        """
        Validates the `data` and mutates it if necessary.

        Example:
            >>> # data = {"title": "Howdy?", "metadata": {"prop1": 1}}
            >>> data["my_filed"] = 1

        :param data: The request data retrieved using `.get_json()`.
        :param entity: The entity object (a new one is being created if `None`).
        :raise ValidationError: When the `data` is invalid.
        """

    @staticmethod
    def _serialize(entity: _Entity | ValidationError, status: HTTPStatus) -> JsonResponse:
        if isinstance(entity, ValidationError):
            return {"errors": entity.messages}, HTTPStatus.UNPROCESSABLE_ENTITY

        serialized = entity.to_json()
        assert isinstance(serialized, dict)

        return serialized, status
