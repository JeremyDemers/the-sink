import type { HasTitle } from '@typedef/global';
import type { Route } from '@typedef/routing';

export namespace Nav {
  export interface Link extends HasTitle<string> {
    readonly route: Route.Definition;
  }
}
