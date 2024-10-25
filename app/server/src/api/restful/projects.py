from http import HTTPStatus

from api.principal import authentication_required
from api.models.project import Project, ProjectStatus

from .restful_api import EntityResource, JsonResponse, resource
from .restful_base import RestfulBase
from .restful_list_base import RestfulListBase, QueryArgs, Queries


@resource("/projects")
class ProjectListResource(RestfulListBase[Project]):
    """
    Project's list item resource.
    """

    @staticmethod
    def get_default_filters() -> dict[str, QueryArgs]:
        return {
            "status_filter": ",".join(
                [status.value for status in ProjectStatus if status != ProjectStatus.ARCHIVED]
            ),
        }

    def get_special_filters(self) -> Queries:
        return {
            "status": lambda q, s: q.filter(self.model.status.in_(str(s).split(","))),
        }


@resource("/projects", "/projects/<int:entity_id>")
class ProjectsResource(RestfulBase[Project]):
    """Project resource"""


@resource("/projects/<int:project_id>/transition/<string:trigger_name>")
class ProjectTransitionResource(EntityResource[Project]):
    """Change project status resource"""

    @authentication_required()
    def put(self, project_id: int, trigger_name: str) -> JsonResponse:
        if not self.model.can_be.edited:
            return self.denied_response

        project = self.model.get_or_404(project_id)

        # Check if given transition is allowed and execute it.
        if trigger_name not in project.allowed_transitions:
            return {"message": "Transition is not allowed"}, HTTPStatus.BAD_REQUEST

        # The `trigger` method is added by the status machine.
        # The call to `project.allowed_transitions` ensures it's
        # initialized.
        project.trigger(trigger_name, original_status=project.status)  # type: ignore[attr-defined]
        project.save(True)

        return project.to_json(), HTTPStatus.OK
