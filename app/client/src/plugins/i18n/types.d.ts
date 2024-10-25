export namespace I18n {
  export namespace Locale {
    export type Id = Intl.UnicodeBCP47LocaleIdentifier;

    export namespace Metadata {
      export interface Definition {
        readonly id: Id;

        /**
         * The name of a language for the language switcher.
         *
         * @example
         * ```typescript
         * 'French (Français)'
         * 'Ukrainian (Українська)'
         * 'Chinese Traditional (中國人)'
         * 'Chinese Simplified (中文簡化)'
         * ```
         */
        readonly name: string;

        /**
         * The flag emoji for the locale.
         *
         * NOTE: generated automatically based on the last part of
         * the ID (should be the country code, e.g. `en-US`).
         */
        readonly emoji?: string;
      }

      export type Defined = Required<Definition>;

      export type List = readonly Defined[];
    }

    export namespace Records {
      export interface Definition {
        /**
         * The translation records.
         *
         * @example
         * ```typescript
         * {
         *   'Hello {{ name }}': 'Bonjour {{ name }}',
         * }
         * ```
         */
        readonly records: Readonly<Record<string, string>>;
      }

      export interface Indexed extends Definition {
        /**
         * The index of an item within the {@see Metadata.List} array.
         */
        readonly index: number;
      }

      export interface Group {
        readonly [id: Id]: Readonly<Indexed>;
      }
    }

    export interface Definition extends Metadata.Definition, Records.Definition {
    }
  }

  export type Params = Record<string, unknown>;

  export type Translator = (text: string, params?: Params) => string;

  export interface Config {
    readonly locales: readonly Locale.Definition[];
    readonly defaultLocale: Locale.Metadata.Definition;
    readonly activeLocaleId: Locale.Id | null;
    readonly onLocaleChange?: (id: Locale.Id) => void;
  }
}
