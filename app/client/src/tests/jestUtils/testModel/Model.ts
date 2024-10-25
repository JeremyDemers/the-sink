import type { AnySchema } from 'yup';

import type { HasTitle } from '@typedef/global';
import type { ModelBase, ModelBaseExisting } from '@typedef/models';
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

export interface TestModel extends ModelBase, HasTitle<string> {
}

export interface TestModelListItem extends Required<TestModel>, ModelBaseExisting {
}

/**
 * An example test model.
 */
export class Model extends BaseModel<TestModel, TestModelListItem> {
  endpoint = '/test-model' as const;

  access: AccessDetails = {
  } as const;

  routes: EntityRoutes = {
    add: new EntityRouteNew({
      path: ['test-model', pkParamNew],
      model: this,
      component: () => null,
    }),
    edit: new EntityRoute({
      path: ['test-model', pkParam],
      model: this,
      component: () => null,
    }),
    view: new EntityRoute({
      path: ['test-model', pkParam],
      model: this,
      component: () => null,
    }),
    list: new EntityRouteCanonical({
      path: ['test-models'],
      model: this,
      component: () => null,
    }),
  };

  validationSchema: AnySchema = Yup.object().shape({
    title: Yup.string().required(),
  });

  emptyModel: TestModel = {
    title: '',
  };

  getLabel = (entity: TestModelListItem): string => entity.title;
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new Model();
