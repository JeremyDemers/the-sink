import type { User } from '@models/User';

export namespace Access {
  export interface Constraints {
    /**
     * The permission a user must have to access the route.
     */
    readonly permission?: User.Permission;

    /**
     * The role a user must have to access the route.
     *
     * NOTE: setting the value to {@see UserRole.Authenticated} means
     * the constraint applies to all logged-in users regardless of
     * their roles.
     */
    readonly role?: User.Role;

    /**
     * The state of whether either of the constraints is enough to access the route.
     *
     * @default `false`
     */
    readonly oneOf?: boolean;
  }

  export interface HasConstraints {
    /**
     * When `false` the access is allowed uniquely to unauthenticated users.
     */
    readonly constraints?: Constraints | false;
  }

  export type Argument =
    | User.Permission
    | User.Role
    | HasConstraints;
}
