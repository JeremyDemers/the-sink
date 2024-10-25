import type { Route } from '@typedef/routing';

import { PageLogin } from './PageLogin';

const PageLoginRoute: Route.Definition = {
  path: '/login',
  component: PageLogin,
  constraints: false,
};

export {
  PageLogin,
  PageLoginRoute,
};
