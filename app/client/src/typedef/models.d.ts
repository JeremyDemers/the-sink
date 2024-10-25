import type { ComponentType } from 'react';
import type { FormikConfig } from 'formik';
import type { SortingState } from '@tanstack/react-table';

import type { BaseModel } from '@models/Base';

import type { Primitive } from './global';

export interface HasTimestamps {
  // May be `undefined` for a non-saved entity.
  readonly created_at?: Primitive.DateTime;
  // May be `undefined` for a non-saved entity.
  readonly updated_at?: Primitive.DateTime;
}

export interface ModelBase extends HasTimestamps {
  readonly id?: number;
}

export type ModelBaseExisting = Required<ModelBase>;

export interface ModelListResponse<Model extends BaseModel<Any, Any>> {
  readonly items: EntityListItemType<Model>[];
  readonly sort: SortingState;
  readonly filters: EntityFiltersType<Model>;
  readonly pager: {
    readonly page: number;
    readonly per_page: number;
    readonly total: number;
  };
}

export type EntityListItemType<Model extends BaseModel<Any, Any>> = Model extends BaseModel<Any, infer ListItem>
  ? ListItem
  : never;

export type EntityType<Model extends BaseModel<Any, Any>> = Model extends BaseModel<infer Entity, Any>
  ? Entity
  : never;

export type EntityFiltersType<Model extends BaseModel<Any, Any>> = Model extends BaseModel<Any, Any, infer Filters>
  ? Filters
  : never;

export interface ModelComponentProps<Model extends BaseModel<Any, Any>> {
  readonly model: Model;
}

export interface ModelFormProps<Model extends BaseModel<Any, Any>> extends ModelComponentProps<Model> {
  readonly config: FormikConfig<EntityType<Model>>;
  // This property is available only on the model edit pages.
  readonly setEntity?: (entity: EntityType<Model>) => void;
}

export interface ModelFormPage<Model extends BaseModel<Any, Any>> extends ModelComponentProps<Model> {
  readonly entityForm: ComponentType<ModelFormProps<Model>>;
  readonly successMessage: string;
  readonly errorMessage: string;
}
