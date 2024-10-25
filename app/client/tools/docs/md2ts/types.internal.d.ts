export namespace Md2Ts.Path {
  export interface Has {
    readonly path: string;
  }

  export interface External extends Has {
    /**
     * The state of whether the resource is part of the repository.
     */
    readonly own: boolean;
  }

  export interface Internal extends Has {
    /**
     * The filesystem path to the resource.
     */
    readonly location: string;
  }

  export interface Invalid extends Has {
    /**
     * The message that explains why the path is invalid.
     */
    readonly error: string;
  }

  export type Processed =
    | External
    | Internal
    | Invalid;

  export namespace Processor {
    export interface Config {
      readonly basePath: string;
      readonly maxDepth: number;
      readonly subPath: string;
      readonly dir: string;
      readonly rootUrl: string;
      readonly rootDir: string;
    }
  }
}
