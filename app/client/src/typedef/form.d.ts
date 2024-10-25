import type React from 'react';

export namespace Form {
  export interface Option {
    readonly label: string;
    readonly value: string | number | boolean;
  }

  export namespace Item {
    export type IntrinsicElementAttrs<
      Name extends keyof React.JSX.IntrinsicElements,
      Extension extends object = object,
      Exclude extends string = '',
    > =
      & Omit<
        React.JSX.IntrinsicElements[Name],
        | 'name'
        | 'value'
        | 'defaultValue'
        | keyof Extension
        | Exclude
      >
      & Extension;

    export interface ChildProps<Attrs extends object, Value> {
      readonly name: string;
      readonly value: Value;
      readonly setValue: (value: Value) => void;
      readonly attributes: Attrs & { readonly required?: boolean };
      readonly clearable?: boolean;
    }
  }
}
