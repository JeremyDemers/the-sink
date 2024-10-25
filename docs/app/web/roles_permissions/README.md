# Roles and permissions

The [Flask Principal](https://pythonhosted.org/Flask-Principal/) library is used as a base for the user role-permission system.

The system includes the following roles and permissions out of the box:

| Role          | View Projects | Edit Projects | View Users | Edit Users |
|---------------|---------------|---------------|------------|------------|
| Admin         | Yes           | Yes           | Yes        | Yes        |
| Scientist     | Yes           | Yes           | No         | No         |
| Authenticated | Yes           | No            | No         | No         |

## Define a new role

This example covers creating a new `Co-Admin` role that can manage users and have the readonly access to the projects.

1. Modify the `Role` enum in the [role.py](/app/server/src/api/principal/role.py) module:
   ```python
   @verify(UNIQUE, CONTINUOUS)
   class Role(IntEnum):
       # ... Existing roles.
       CO_ADMIN = 4
   ```

2. Edit the `ModelOperations` in the [user.py](/app/server/src/api/models/user.py) module:
   ```diff
   -         self.created.by(Role.ADMIN)
   +         self.created.by(Role.ADMIN, Role.CO_ADMIN)
   -         self.viewed.by(Role.ADMIN)
   +         self.viewed.by(Role.ADMIN, Role.CO_ADMIN)
   -         self.edited.by(Role.ADMIN)
   +         self.edited.by(Role.ADMIN, Role.CO_ADMIN)
   ```

3. Edit the `ModelOperations` in the [project.py](/app/server/src/api/models/project.py) module:
   ```diff
   -         self.viewed.by(Role.ADMIN, Role.SCIENTIST, Role.AUTHENTICATED)
   +         self.viewed.by(Role.ADMIN, Role.SCIENTIST, Role.AUTHENTICATED, Role.CO_ADMIN)
   ```

4. Update client `UserRole` definition in the [models/User/constants.ts](/app/client/src/models/User/constants.ts):
   ```typescript
   export const UserRole = {
     // ... Existing roles.
     CoAdmin: 4,
   } as const;
   ```

## Create a new permission

This example covers creating a new `execute project custom action` permission and showing its usage.

1. Edit the `ModelOperations` in the [project.py](/app/server/src/api/models/project.py) module:
   ```diff
   diff --git a/app/server/src/api/models/project.py b/app/server/src/api/models/project.py
   index 31b4d21..238543f 100644
   --- a/app/server/src/api/models/project.py
   +++ b/app/server/src/api/models/project.py
   @@ -1,5 +1,5 @@
    from enum import verify, UNIQUE, StrEnum
   -from typing import Any
   +from typing import Any, Final

    from flask import current_app
    from marshmallow import fields, validate
   @@ -9,6 +9,7 @@ from api.models.mixins.entity import EntityMixin, EntityOperations, EntityMixinS
    from api.models.mixins.has_author import HasAuthor, HasAuthorSchema
    from api.models.mixins.workflow import WorkflowMixin, TransitionConfig
    from api.models.user import UserSchema
   +from api.principal.operation import Operation
    from api.principal.role import Role


   @@ -29,6 +30,9 @@ class ModelOperations(EntityOperations):  # pylint: disable=locally-disabled, to
            self.edited.by(Role.ADMIN, Role.SCIENTIST)
            self.deleted.by(Role.ADMIN)

   +        self.executing_custom_action: Final[Operation] = Operation("execute project custom action")
   +        self.executing_custom_action.by(Role.ADMIN)
   +

    @verify(UNIQUE)
    class Statuses(StrEnum):
   ```

### Check for the user's permission

#### Client

React application has the [AuthContext](/app/client/src/context/AuthProvider.tsx) that exposes the `hasAccess` method:

```typescript jsx
import React, { useContext } from 'react';

import { AuthContext } from '@context/AuthProvider';

const MyComponent: React.FC = () => {
  const { hasAccess } = useContext(AuthContext);
  const userCanExecuteCustomAction = hasAccess('execute project custom action');

  return (
    <div>
      {
        userCanExecuteCustomAction
          ? 'User can execute the custom action'
          : 'User cannot execute the custom action'
      }
    </div>
  );
};
```

Usage example of the permission checks in the client can be seen [here](../project/restful#create-new-project-api-route).

#### Server

On the server side permissions are generally used to check the route access. It can be achieved by adding the [authentication_required](/app/server/src/api/principal/__init__.py) decorator. Usage example of this decorator can be found [here](../project/restful#create-new-project-api-route)

## Notes

The Flask application automatically discovers configured permissions by finding the descendants of the [HasOperations](/app/server/src/api/principal/operation.py) class. Each such implementation must provide the `can_be` property of [Operations](/app/server/src/api/principal/operation.py) type or its subtype.

Each attribute of the [Operations](/app/server/src/api/principal/operation.py) class that is of [Operation](/app/server/src/api/principal/operation.py) type is a permission definition.

### Example

Let's define the opinionated object that requires a permission to run something.

```python
from typing import Final

from api.principal.role import Role
from api.principal.operation import HasOperations, Operation, Operations


class MyThingOperations(Operations):
   def __init__(self) -> None:
       self.changed: Final[Operation] = Operation("change my thing")
       self.changed.by(Role.ADMIN)


class MyThing(HasOperations[MyThingOperations]):
   can_be = MyThingOperations()

   def change(self) -> str:
       if self.can_be.changed:
           return "can be changed"

       return "cannot be changed"
```
