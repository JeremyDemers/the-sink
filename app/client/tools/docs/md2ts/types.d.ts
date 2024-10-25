import type { Md2Ts as Md2TsInternal } from './types.internal.d';

export namespace Md2Ts {
  export interface HasTitle {
    readonly title: string;
  }

  export interface Anchor extends HasTitle {
    readonly id: string;
    readonly children: readonly Anchor[];
  }

  export interface Breadcrumb extends Md2TsInternal.Path.Has, HasTitle {
  }

  export interface Metadata {
    /**
     * The last item is always the page itself.
     */
    readonly breadcrumbs: readonly Breadcrumb[];
    readonly navigation: readonly Anchor[];
  }

  export interface Page {
    readonly html: string;
    readonly images: Readonly<Record<string, string>>;
    readonly metadata: Metadata;
  }
}
