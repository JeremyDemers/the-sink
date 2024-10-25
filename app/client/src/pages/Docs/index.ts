import type { Documentation } from './types.d';
import { PageDocs } from './Docs';
import { Pages } from './pages';
import { routes } from './routes';

const Docs = {
  /**
   * The compiled collection of the documentation routes.
   *
   * @see {import('./routes').routes}
   */
  routes: Object
    .entries(routes)
    .reduce(
      (accumulator, [name, route]) => {
        if (__DEV__) {
          const hasPages = Object
            .keys(Pages)
            .some((path) => path.startsWith(route.path));

          if (!hasPages) {
            throw new Error(`The "${name}" route has no pages.`);
          }
        }

        accumulator[name as Documentation.Route.Name] = {
          ...route,
          path: `${route.path}/*`,
          component: PageDocs,
        };

        return accumulator;
      },
      {} as Documentation.Route.Collection,
    ),
} as const;

export * from './Markdown';
export {
  Docs,
  type Documentation,
};
