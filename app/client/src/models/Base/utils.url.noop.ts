import type { Access } from '@typedef/access';

import { PageError } from '@pages/Error';

import {
  EntityRouteNew,
  EntityRoute,
  EntityRouteCanonical,
  type EntityRoutes,
} from './utils.url';

import {
  pkParam,
  pkParamNew,
} from './constants';

const permission = '__page__noop__';
let noopCallId = 0;

/**
 * Use one of these dummy definitions when a certain operation is inapplicable
 * to an entity type.
 *
 * Let's say the `add` should not exist for the `checks` entity type because
 * the items creation is automated.
 *
 * @example
 * ```typescript
 * routes: EntityRoutes = {
 *    ...
 *    add: noop.routes.add,
 *    ...
 * };
 * ```
 */
export const noop = {
  get routes(): EntityRoutes {
    const slug = `noop-${++noopCallId}`;
    const constraints: Access.Constraints = {
      permission: permission + noopCallId,
    };

    return {
      add: new EntityRouteNew({
        path: [slug, pkParamNew],
        model: undefined,
        component: PageError,
        constraints,
      }),
      edit: new EntityRoute({
        path: [slug, pkParam],
        model: undefined,
        component: PageError,
        constraints,
      }),
      view: new EntityRoute({
        path: [slug, pkParam],
        model: undefined,
        component: PageError,
        constraints,
      }),
      list: new EntityRouteCanonical({
        path: [slug],
        model: undefined,
        component: PageError,
        constraints,
      }),
    };
  },
};
