import type { User } from '@models/User';

import type { Access } from './access';

export interface AuthUser extends User.ModelListItem {
  readonly permissions: readonly User.Permission[];
}

export interface AuthCookie {
  readonly user: AuthUser;
  /**
   * A timestamp in seconds.
   *
   * @example 1718017447
   */
  readonly expires: number;
  /**
   * The number of seconds a session is alive.
   *
   * @example 3600
   */
  readonly expires_in: number;
}

export interface AuthContextValues {
  readonly hasAccess: (thing: Access.Argument) => boolean;
  readonly refreshSession: () => Promise<AuthCookie | undefined>;
  readonly login: VoidFunction;
  readonly logout: VoidFunction;
  readonly auth?: AuthCookie;
}
