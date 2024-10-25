# API endpoints

Application API routing system developed on top of [Flask-RESTful](https://flask-restful.readthedocs.io/en/latest/) library. That allows to define API routes in classes thus allows to bring abstraction layer to the route definitions. Application comes with several abstraction layers for model/entity like routes:

- [RestfulBase](/app/server/src/api/restful/restful_base.py): abstract layer for the model CRUD operations:
  - Have in build access controller system, that allows to define required user permission for each route.
  - Allows to disable specific model operations, like delete.
  - Handle requests validations, using marshmallow [library](https://marshmallow.readthedocs.io/en/stable/), for instance: create user request is impossible without user emails.
- [RestfulListBase](/app/server/src/api/restful/restful_list_base.py): abstract layer for the model listing pages:
  - Have in build access controller system, that allows to define required user permission for each route.
  - Sort and default sort.
  - Filter and default filter.
  - Pagination.

## Enable filter for none string column

RestfulListBase has in-build filter handler for model string properties: you don't need to do anything for such cases. But there are cases where you want your listings to be filtered by none string columns or even to add combined filter.

None string project filters are defined in the [ProjectListResource](/app/server/src/api/restful/projects.py).

Let's take a look at the following examples:

- *Combined* filter - `author_name_email`. It will allow us to filter projects by author name and
email address.
   1. Add our custom filter option into `ProjectListResource` `get_special_filters` method:
       ```python
       def get_special_filters(self) -> Queries:
           return {
               # ... other filters.
               "author_name_email": lambda q, s: q.join(User).filter(
                   User.name.ilike(f"%{s}%") | User.email.ilike(f"%{s}%")
               ),
           }
       ```
   2. Add `author_name_email` filter input to the [project interface](../interface#project-filter-form---add-new-filters)

- *Simple* filter - by project id integer property.
    1. Add our custom filter option into `ProjectListResource` `get_special_filters` method:
        ```python
        def get_special_filters(self) -> Queries:
            return {
                # ... other filters.
                "id": lambda q, s: q.filter(self.model.id == s),
            }
        ```
     2. Add `id` filter input to the [project interface](../interface#project-filter-form---add-new-filters)

## Add advanced sort option

Unlike filters `RestfulListBase` sorting works for strings and integer values but there are cases where you will need to add custom logic, for instance you want to be able to sort project by the project author's ID:

1. Extend [ProjectListResource](/app/server/src/api/restful/projects.py) `get_special_sorting` method:
    ```python
    def get_special_sorting(self) -> dict[str, Callable[[Query, QueryArgs], Query]]:
        return {
            "author_id": lambda q, s: (
                q.join(User).order_by(User.id.desc() if s == "desc" else User.id.asc())
            ),
        }
    ```
2. Add new column to the project list [table](../interface#project-list---add-new-columns)

## Create new Project API route:

Let's add new project API route that will execute arbitrary action with the project it can be anything
like trigger email notification to someone, trigger synchronization of the project with external third party api etc.:

1. Define new `EXECUTE_PROJECT_CUSTOM_ACTION` permission and assign it to one of the [roles](../../roles_permissions#create-new-permission).
2. Define new resource handler in the projects resources [file](/app/server/src/api/restful/projects.py)
    ```python
    #... existing project resources.
    @resource("/projects/<int:project_id>/custom-action", endpoint="execute_project_custom_action")
    class ProjectCustomActionResource(EntityResource[Project]):
        """Execute project custom action"""

        @authentication_required()
        def post(self, project_id: str) -> JsonResponse:
            if not self.model.can_be.executing_custom_action:
                return self.denied_response

            project = self.model.get_or_404(project_id)
            # ALWAYS log such actions.
            current_app.logger.info(
                f"Project {project.format_label()} custom action has been triggered "
                f"by {project.format_current_user_email()}"
            )

            # Make a call to utility method that will execute project custom action
            # my_custom_action(project)

            return {"status": "ok"}, HTTPStatus.OK
    ```
    Code above adds a new `POST` API endpoint: `/api/projects/THE_PROJECT_ID/custom-action`. In case you need to use different HTTP method you can define `GET`, `PUT`, or `DELETE` methods instead.
3. Extend project [model](/app/client/src/models/Project/ProjectModel.ts) in the client application:
    ```typescript
    // ... rest of the methods.
    /**
     * Execute custom action.
     *
     * @param {Project} project
     *   The project entity.
     *
     * @returns {Promise<{message: string}>}
     *   Promise that resolves to custom action message.
    */
    executeCustomAction = (project: Project, transition: string): Promise<{message: string}> => (
      axios.put(`${this.endpoint}/${project.id}/custom-action`)
        .then(response => response.data)
      );
    ```
4. Add a button to the project edit [form](/app/client/src/models/Project/pages/components/ProjectUpsertForm.tsx) that will trigger custom action:
    ```typescript jsx
    {hasAccess('execute custom project action') && (
      <button
        type="button"
        disabled={isSubmitting}
        className={classNames('btn btn--secondary ms-3', { 'btn--loading': isSubmitting })}
        onClick={() => {
          // Disable the whole form and show the throbber.
          formik.setSubmitting(true);
          ProjectModel.executeCustomAction(project)
            .then(() => toast.success(t('Custom action successfully executed')))
            .catch(() => toast.error(t('Unable to execute custom action.')))
            // Enable form editing and hide the throbber.
            .finally(() => formik.setSubmitting(false));
        }}
      >
        {t('Trigger custom action')}
      </button>
    )}
    ```
