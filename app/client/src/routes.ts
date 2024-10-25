import type { Route } from '@typedef/routing';

import UserModel from '@models/User';
import ProjectModel from '@models/Project';

import { Docs } from '@pages/Docs';
import { PageErrorRoute } from '@pages/Error';
import { PageExamplesRoute } from '@pages/Examples';
import { PageLoginRoute } from '@pages/Login';

export const routes: readonly Route.Definition[] = [
  PageLoginRoute,
  PageExamplesRoute,
  ...Object.values(ProjectModel.routes),
  ...Object.values(UserModel.routes),
  ...Object.values(Docs.routes),
  PageErrorRoute,
];
