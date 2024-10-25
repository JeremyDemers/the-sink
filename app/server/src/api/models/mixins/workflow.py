from abc import abstractmethod
from typing import Any, Callable, NotRequired, TypedDict

from sqlalchemy.orm import Mapped
from sqlalchemy.ext.hybrid import hybrid_property
from transitions import Machine

from api.database import db, Model


class TransitionConfig(TypedDict):
    """
    The transition config type.

    Arguments for the conditions, unless, before, prepare or after callbacks can be passed via
    trigger method.
    Example:
         my_entity.trigger("trigger_name", initial_status=my_entity.status)
        ...
        def _log_transition(self, **kwargs: dict[str, Any]) -> None:
            original_status = kwargs.get("original_status")
            current_app.logger.info(
                f"Project:{self.entity.id} transition change from {original_status} "
                f"to {self.entity.status}, by user: {current_user.id}"
            )

    """

    trigger: str
    source: str | list[str]
    dest: str
    conditions: NotRequired[list[str | Callable[..., bool]]]
    unless: NotRequired[list[str | Callable[..., bool]]]
    before: NotRequired[list[str | Callable[..., None]]]
    after: NotRequired[list[str | Callable[..., None]]]


class WorkflowMixin(Model):  # pylint: disable=locally-disabled, too-few-public-methods
    """
    Mixin class for integrating a status machine workflow with a SQLAlchemy model.

    This mixin adds a "status" column to the model and provides methods for initializing
    the status machine and converting the entity to a dictionary.

    Example:
        >>> class Project(WorkflowMixin):
        >>>     @staticmethod
        >>>     def _get_workflow_statuses() -> list[str]:
        >>>         return [status.value for status in Statuses]
        >>>
        >>>     @staticmethod
        >>>     def _get_workflow_initial_status() -> str:
        >>>         return Statuses.DRAFT.value
        >>>
        >>>     def _get_workflow_transitions(self) -> list[TransitionConfig]:
        >>>         return [
        >>>             TransitionConfig(
        >>>                 trigger="complete",
        >>>                 source=Statuses.DRAFT.value,
        >>>                 dest=Statuses.COMPLETED.value,
        >>>                 after=[self._log_transition]
        >>>             ),
        >>>             TransitionConfig(
        >>>                 trigger="back_to_draft",
        >>>                 source=Statuses.COMPLETED.value,
        >>>                 dest=Statuses.DRAFT.value,
        >>>                 after=[self._log_transition]
        >>>             ),
        >>>             TransitionConfig(
        >>>                 trigger="archive",
        >>>                 source=[Statuses.DRAFT.value, Statuses.COMPLETED.value],
        >>>                 dest=Statuses.ARCHIVED.value,
        >>>                 after=[self._log_transition]
        >>>             ),
        >>>             TransitionConfig(
        >>>                 trigger="restore",
        >>>                 source=Statuses.ARCHIVED.value,
        >>>                 dest=Statuses.DRAFT.value,
        >>>                 after=[self._log_transition]
        >>>             ),
        >>>         ]
    """

    __abstract__ = True

    _status_machine: Machine | None = None

    status: Mapped[str] = db.Column(db.String(50))

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.__init_status_machine()

    @hybrid_property
    def allowed_transitions(self) -> list[str]:
        """
        Get the list of available trigger names for the current entity status.
        """
        status_machine = self.__init_status_machine()
        transitions = []

        for trigger in status_machine.get_triggers(self.status):
            if getattr(self, f"may_{trigger}")():
                transitions.append(trigger)

        return transitions

    @staticmethod
    @abstractmethod
    def _get_workflow_statuses() -> list[str]:
        """
        Get the list of workflow statuses.

        Example:
            >>> return ["draft", "needs_review", "processing"]
        """
        raise NotImplementedError

    @staticmethod
    @abstractmethod
    def _get_workflow_initial_status() -> str:
        """
        Get a default entity status.

        Example:
            >>> return "draft"
        """
        raise NotImplementedError

    @abstractmethod
    def _get_workflow_transitions(self) -> tuple[TransitionConfig, ...]:
        """
        Get the list of workflow transitions.

        Example:
            >>> return (
            >>>     TransitionConfig(
            >>>         trigger="ready_for_review",
            >>>         source="Statuses.DRAFT.value",
            >>>         dest="Statuses.NEEDS_REVIEW.value",
            >>>     ),
            >>>     ....
            >>>     TransitionConfig(
            >>>         trigger="process",
            >>>         source="Statuses.NEEDS_REVIEW.value",
            >>>         dest="Statuses.PROCESSING.value",
            >>>     ),
            >>> )
        """
        raise NotImplementedError

    def __init_status_machine(self) -> Machine:
        if not self._status_machine:
            self._status_machine = Machine(
                model=self,
                states=self._get_workflow_statuses(),
                initial=self._get_workflow_initial_status() if not self.status else self.status,
                transitions=self._get_workflow_transitions(),
                model_attribute="status",
                auto_transitions=False,
            )

        return self._status_machine
