import type { Access } from './access';
import type { HasComponent, HasPath } from './global';

export namespace Route {
  export interface Definition<
    ComponentProps extends object = object,
  > extends
    HasComponent<ComponentProps>,
    Access.HasConstraints,
    HasPath<string> {
  }
}
