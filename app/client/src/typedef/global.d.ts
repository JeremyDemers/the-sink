import type { ComponentType } from 'react';
import type { Tagged } from 'type-fest';

export interface HasComponent<Props extends object = object> {
  readonly component: ComponentType<Props>;
}

export interface HasLabel<T> {
  readonly label: T;
}

export interface HasPath<T> {
  readonly path: T;
}

export interface HasTitle<T> {
  readonly title: T;
}

export type ObjectValues<T extends object> = T[keyof T];

export namespace Primitive {
  // Format: `'Y-m-d'`.
  export type Date = Tagged<string, 'Primitive.Date'>;

  // E.g. `'2024-07-29T11:59:13.696243'`.
  export type DateTime = Tagged<string, 'Primitive.DateTime'>;
}
