import type { AnySchema } from 'yup';

import type { AuthUser } from '@typedef/auth';

import Yup from '@plugins/yup';
import {
  BaseModel,
  EntityRoute,
  EntityRouteNew,
  EntityRouteCanonical,
  pkParam,
  pkParamNew,
  type AccessDetails,
  type EntityRoutes,
} from '@models/Base';

import type { User } from './types.d';
import { UserRole } from './constants';
import { UserCreatePage } from './pages/UserCreatePage';
import { UserEditPage } from './pages/UserEditPage';
import { UsersListPage } from './pages/UsersListPage';

export class UserModel extends BaseModel<User.Model, User.ModelListItem, User.Filters> {
  endpoint = '/users' as const;

  access: AccessDetails = {
    delete: {
      constraints: {
        permission: 'delete users',
      },
    },
  } as const;

  routes: EntityRoutes = {
    add: new EntityRouteNew({
      path: ['users', pkParamNew],
      model: this,
      component: UserCreatePage,
      constraints: {
        permission: 'create users',
      },
    }),
    edit: new EntityRoute({
      path: ['users', pkParam],
      model: this,
      component: UserEditPage,
      constraints: {
        permission: 'edit users',
      },
    }),
    view: new EntityRoute({
      path: ['users', pkParam],
      model: this,
      component: UserEditPage,
      constraints: {
        permission: 'view users',
      },
    }),
    list: new EntityRouteCanonical({
      path: ['users'],
      model: this,
      component: UsersListPage,
      constraints: {
        permission: 'view users',
      },
    }),
  };

  validationSchema: AnySchema = Yup.object().shape({
    email: Yup.string().email().required(),
    role: Yup.string().required(),
  });

  emptyModel: User.Model = {
    email: '',
    role: UserRole.Authenticated,
    is_active: true,
  };

  getLabel = (entity: User.ModelListItem): string => entity.name;

  canBeEdited = (model: User.Model, authUser: AuthUser | undefined) => (
    model.id !== authUser?.id
  );

  canBeDeleted = (model: User.Model, authUser: AuthUser | undefined) => (
    this.canBeEdited(model, authUser)
  );
}
