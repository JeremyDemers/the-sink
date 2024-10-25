# Project Model

Project model is build on top of [SQLAlchemy ORM library](https://docs.sqlalchemy.org/) for Python. SQLAlchemy provides a full suite of well-known enterprise-level persistence patterns, designed for efficient and high-performing database access.

Bellow example shows, how we can extend project with a new field called `Calculated value` to the project, assuming that this field will hold string values:

## Extend project model with a new field

To add or modify fields in the Project model, you need to update the model class [definition](/app/server/src/api/models/project.py).

```python
class Project(EntityMixin, HasAuthor, WorkflowMixin):
    # ... existing definitions.

    # --> New column!
    calculated_value = db.Column(db.String)

    # ... existing definitions.
```

In this example we are adding `calculated_value` model property as `String`. The full list of SQLAlchemy field types can be found [here](https://docs.sqlalchemy.org/en/13/core/type_basics.html).

## Apply model changes to the database

To apply changes to the database schema, you need to use [Flask-Migrate](https://flask-migrate.readthedocs.io/en/latest/), which is an extension that handles SQLAlchemy database migrations for Flask applications using Alembic.

Pre-requirements, SSH to the Flask service container:

```shell
slw bash
```

After modifying your model, generate a new migration script to reflect the changes:

```shell
flask db migrate -m "Add calculated value column to Project model"
```

Command above will create new file in the project [directory](/app/server/migrations/versions) that will contain database migration script. To apply the database migration to your database schema you can execute following command:

```shell
flask db upgrade
```

This command will automatically apply all migrations that haven't been applied yet. Another option would be to restart.

**Note:** Whenever new migration file will be deployed to dev/stage/UAT/prod env it will be applied automatically.

## Include new field into the project API response

As Project model has been changed, we need to instruct Flask how to serialize it into JSON. Todo this we need to update Project [marshmallow schema](https://marshmallow.readthedocs.io/en/stable/marshmallow.schema.html) definitions. This library is used not to just dump model into JSON, but to [validate](https://marshmallow.readthedocs.io/en/stable/quickstart.html#validation) client payload.

There are two definitions that is used in the App:

- `ProjectSchema`: that is used for the project CRUD operations.
- `ProjectListSchema`: that is used for the project listings display. More lightweight version comparing to the Project schema.

Both of these schemas are located at the end of the project model [file](/app/server/src/api/models/project.py)

Let's add our field to both responses list and project GET API, to do so we can add it to both Schemas or to the Base class:

```python
class ProjectListSchema(EntityMixinSchema, HasAuthorSchema):
    # ... existing definitions.
    calculated_value = fields.Str()
```

Or, for instance, if we need it only on the project view/edit/delete pages we need to extend only `ProjectSchema`:

```python
class ProjectSchema(ProjectListSchema):
    # ... existing definitions.
    calculated_value = fields.Str()
```

Refer to the [how to extend project interface section](../interface) for information on how to add `calculated_value` to the project interface.
