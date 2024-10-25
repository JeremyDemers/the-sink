import type { ObjectValues } from '@typedef/global';

import type { ModalAction } from './constants';

export namespace ModalWindow {
  export type Action = ObjectValues<typeof ModalAction>;

  export type Callback =
    | VoidFunction
    | (() => Promise<void>);

  export interface Icon {
    readonly name: string;
    readonly color:
      | 'green'
      | 'red'
      | 'orange'
      | 'neutral';
  }

  export interface Props {
    readonly title: string;
    readonly close: Callback;
    readonly accept: Callback;
    readonly closeButtonText: string;
    readonly acceptButtonText: string;
    readonly text?: string;
    readonly icon?: Icon;
    readonly onDone?: VoidFunction;
    readonly onError?: (action: ModalAction, error: unknown) => void;
    readonly closeOnOverlayClick?: boolean;
  }

  export interface Controller {
    readonly open: boolean;
    readonly show: VoidFunction;
    readonly hide: VoidFunction;
    readonly toggle: VoidFunction;
  }
}
