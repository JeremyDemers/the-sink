from api.restful.restful_api import restful, resource

# Register restful resources.
import api.restful.users
import api.restful.projects
import api.restful.example


__all__ = [
    "restful",
    "resource",
    "api",
]
