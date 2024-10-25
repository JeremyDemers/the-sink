from unittest import TestCase

from api.database import db
from api.models.mixins.workflow import WorkflowMixin, TransitionConfig


class TestEntityWorkflow(WorkflowMixin):  # pylint: disable=locally-disabled, too-few-public-methods
    """DB model stub to test the Workflow mixin"""

    __test__ = False

    id = db.Column(db.Integer, primary_key=True)
    property = db.Column(db.String)

    @staticmethod
    def _get_workflow_statuses() -> list[str]:
        return ["draft", "needs_review", "processing"]

    @staticmethod
    def _get_workflow_initial_status() -> str:
        return "draft"

    def _get_workflow_transitions(self) -> tuple[TransitionConfig, ...]:
        return (
            TransitionConfig(
                trigger="ready_for_review",
                source="draft",
                dest="needs_review",
            ),
            TransitionConfig(
                trigger="process",
                source="needs_review",
                dest="processing",
            ),
            TransitionConfig(
                trigger="reset",
                source=["needs_review", "processing"],
                dest="draft",
            ),
        )


class WorkflowMixinTestCase(TestCase):
    """Contains tests for the EntityMixin class."""

    def setUp(self) -> None:
        self.entity = TestEntityWorkflow(property="Test Workflow Entity")

    def test_initial_status(self) -> None:
        assert self.entity.status == "draft"

    def test_transitions(self) -> None:
        self.entity.trigger("ready_for_review")  # type: ignore[attr-defined]
        assert self.entity.status == "needs_review"
        assert self.entity.allowed_transitions == ["process", "reset"]

        self.entity.trigger("process")  # type: ignore[attr-defined]
        assert self.entity.status == "processing"
        assert self.entity.allowed_transitions == ["reset"]

        self.entity.trigger("reset")  # type: ignore[attr-defined]
        assert self.entity.status == "draft"
        assert self.entity.allowed_transitions == ["ready_for_review"]
