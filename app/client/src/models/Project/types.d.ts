import type { ObjectValues } from '@typedef/global';
import type { ModelBase as ModelBaseDefinition, ModelBaseExisting } from '@typedef/models';
import type { ProjectStatus, ProjectTransition } from './constants';

export namespace Project {
  export type Status = ObjectValues<typeof ProjectStatus>;
  export type Transition = ObjectValues<typeof ProjectTransition>;

  export type Filters = Partial<
    Record<
      | 'title_filter'
      | 'status_filter'
      | 'created_from_filter'
      | 'created_to_filter'
      | 'author_name_filter',
      string
    >
  >;

  interface ModelBase extends ModelBaseDefinition {
    readonly title: string;
    readonly status?: Status;
  }

  export interface Model extends ModelBase {
    readonly description: string;
    readonly allowed_transitions?: readonly Transition[];
  }

  export interface ModelListItem extends Required<ModelBase>, ModelBaseExisting {
    readonly author: {
      readonly name: string;
      readonly id: number;
    };
  }
}
