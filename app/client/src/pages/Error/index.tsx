import type { Route } from '@typedef/routing';

import { PageError } from './PageError';

const PageErrorRoute: Route.Definition = {
  path: '*',
  component: PageError,
};

export {
  PageError,
  PageErrorRoute,
};
