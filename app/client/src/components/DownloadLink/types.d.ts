import type { AxiosError } from 'axios';
import type { ObjectValues } from '@typedef/global';

import { DownloadingState } from './constants';

export namespace Download {
  export namespace Link {
    export type State = ObjectValues<typeof DownloadingState>;

    export namespace Children {
      export type State =
        | {
          readonly value: Exclude<Link.State, typeof DownloadingState.Error>;
        }
        | {
          readonly value: typeof DownloadingState.Error;
          readonly error: unknown | AxiosError | Error;
        };

      export interface Props {
        readonly state: State;
      }
    }
  }
}
