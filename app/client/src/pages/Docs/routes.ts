import { UserRole } from '@models/User';

import type { Documentation } from './types';

/**
 * The path of each route:
 * - must start with a slash;
 * - must not end with a slash;
 * - must contain just one chunk that is the directory
 *   name inside the `./Build` folder.
 *
 * @example
 * ```typescript
 * {
 *   docs: {
 *     path: '/docs',
 *     constraints: {
 *       role: UserRole.Authenticated,
 *     },
 *   },
 * }
 * ```
 */
export const routes: Documentation.Route.Definitions = {
  docs: {
    path: '/docs',
    constraints: {
      role: UserRole.Authenticated,
    },
  },
} as const;
