import type { ReactNode, JSX } from 'react';

export namespace Table.Model {
  export interface Action<C extends ((...args: Any[]) => ReactNode) | keyof JSX.IntrinsicElements> {
    readonly label: string;
    readonly icon: string;
    readonly component: C;
    readonly props: C extends ((props: infer P) => ReactNode) ? P : JSX.IntrinsicElements[C];
  }
}
