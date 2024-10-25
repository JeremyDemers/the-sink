import type { Route } from '@typedef/routing';

import { UserRole } from '@models/User';

import { PageExamples } from './PageExamples';

const PageExamplesRoute: Route.Definition = {
  path: '/examples',
  component: PageExamples,
  constraints: {
    role: UserRole.Authenticated,
  },
};

export {
  PageExamples,
  PageExamplesRoute,
};
