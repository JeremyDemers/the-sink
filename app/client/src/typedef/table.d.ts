import type { FormikConfig } from 'formik';

import type { BaseModel } from '@models/Base';

import type { EntityFiltersType } from './models';

export interface PaginationState {
  readonly pageIndex: number;
  readonly pageSize: number;
  readonly rowCount: number;
}

export interface FilterFormProps<Model extends BaseModel<Any, Any>> {
  readonly filters: EntityFiltersType<Model>;
  readonly config:
    & Pick<
      FormikConfig<EntityFiltersType<Model>>,
      | 'onSubmit'
      | 'enableReinitialize'
    >
    & {
      readonly resetForm: (filters: EntityFiltersType<Model>) => void;
    };
  readonly isLoading: boolean;
}

export interface TabItem {
  readonly id: string;
  readonly title: string;
  readonly params?: Record<string, string>;
}

export type TabsList = readonly [TabItem, ...TabItem[]];
