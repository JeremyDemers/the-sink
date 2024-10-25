from enum import verify, UNIQUE, StrEnum
from typing import Any

from flask import current_app
from marshmallow import fields, validate
from sqlalchemy.orm import Mapped

from api.database import db
from api.models.mixins.entity import EntityMixin, EntityOperations, EntityMixinSchema, EntitySchema
from api.models.mixins.has_author import HasAuthor, HasAuthorSchema
from api.models.mixins.workflow import WorkflowMixin, TransitionConfig
from api.principal.role import Role


class ModelOperations(EntityOperations):  # pylint: disable=locally-disabled, too-few-public-methods
    """
    Defines the following permissions:
        - `create projects`
        - `view projects`
        - `edit projects`
        - `delete projects`
    """

    def __init__(self) -> None:
        super().__init__("projects")

        self.created.by(Role.ADMIN, Role.SCIENTIST)
        self.viewed.by(Role.ADMIN, Role.SCIENTIST, Role.AUTHENTICATED)
        self.edited.by(Role.ADMIN, Role.SCIENTIST)
        self.deleted.by(Role.ADMIN)


@verify(UNIQUE)
class ProjectStatus(StrEnum):
    """
    The statuses of a project.
    """

    DRAFT = "draft"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class ProjectListSchema(EntityMixinSchema, HasAuthorSchema):
    """
    The model's list item schema.
    """

    title = fields.Str(
        validate=validate.Length(min=1),
    )

    status = fields.Str(
        # The value can be updated only during a workflow transition.
        dump_only=True,
    )


class ProjectSchema(ProjectListSchema):  # pylint: disable=locally-disabled, too-many-ancestors
    """
    The model's schema.
    """

    description = fields.Str(
        validate=validate.Length(min=1),
    )

    allowed_transitions = fields.List(
        fields.Str(),
        # The property is computed thus cannot be updated.
        dump_only=True,
    )


class Project(EntityMixin, HasAuthor, WorkflowMixin):
    """Project ORM model"""

    can_be = ModelOperations()

    schema = EntitySchema(
        item=ProjectSchema(),
        list_item=ProjectListSchema(),
    )

    title: Mapped[str] = db.Column(
        db.String,
    )

    description: Mapped[str] = db.Column(
        db.Text,
    )

    def get_label(self) -> str:
        return str(self.title)

    @staticmethod
    def _get_workflow_statuses() -> list[str]:
        return [status.value for status in ProjectStatus]

    @staticmethod
    def _get_workflow_initial_status() -> str:
        return ProjectStatus.DRAFT.value

    def _get_workflow_transitions(self) -> tuple[TransitionConfig, ...]:
        return (
            TransitionConfig(
                trigger="complete",
                source=ProjectStatus.DRAFT.value,
                dest=ProjectStatus.COMPLETED.value,
                after=[self._log_transition],
            ),
            TransitionConfig(
                trigger="back_to_draft",
                source=ProjectStatus.COMPLETED.value,
                dest=ProjectStatus.DRAFT.value,
                after=[self._log_transition],
            ),
            TransitionConfig(
                trigger="archive",
                source=[ProjectStatus.DRAFT.value, ProjectStatus.COMPLETED.value],
                dest=ProjectStatus.ARCHIVED.value,
                after=[self._log_transition],
            ),
            TransitionConfig(
                trigger="restore",
                source=ProjectStatus.ARCHIVED.value,
                dest=ProjectStatus.DRAFT.value,
                after=[self._log_transition],
            ),
        )

    def _log_transition(self, **kwargs: dict[str, Any]) -> None:
        original_status = kwargs.get("original_status")
        current_app.logger.info(
            f"Project {self.format_label()} status has changed from {original_status} "
            f"to {self.status} by {self.format_current_user_email()}"
        )


__all__ = [
    "Project",
    "ProjectStatus",
]
