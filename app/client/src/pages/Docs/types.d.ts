import type { Route as RouteBase } from '@typedef/routing';

export namespace Documentation {
  export namespace Route {
    // @todo: Compute via Vite plugin to enhance type-safety.
    export type Name = string;

    export type Definitions = Readonly<Record<Name, Omit<RouteBase.Definition, 'component'>>>;

    export type Collection = Record<Name, RouteBase.Definition>;
  }
}
