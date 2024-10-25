import type { ObjectValues } from '@typedef/global';
import type { ModelBase, ModelBaseExisting } from '@typedef/models';
import type { UserRole } from './constants';

export namespace User {
  export type Role = ObjectValues<typeof UserRole>;

  export type Permission = string;

  export type Filters = Partial<
    Record<
      | 'role_filter'
      | 'email_filter'
      | 'name_filter',
      string
    >
  >;

  export interface Model extends ModelBase {
    readonly role: Role;
    readonly email: string;
    readonly name?: string;
    readonly is_active?: boolean;
  }

  export interface ModelListItem extends Required<Model>, ModelBaseExisting {
  }
}
