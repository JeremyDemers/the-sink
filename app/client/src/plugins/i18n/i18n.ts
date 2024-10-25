import type { Writable } from 'type-fest';
import mustache from 'mustache';

import { I18n } from './types.d';

function getMetadataDefined(metadata: I18n.Locale.Metadata.Definition): I18n.Locale.Metadata.Defined {
  return {
    ...metadata,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    emoji: metadata.emoji || metadata.id
      .split('-')
      .at(-1)!
      .toUpperCase()
      .split('')
      .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
      .join(''),
  };
}

export class Internationalization {
  readonly locales!: I18n.Locale.Metadata.List;

  readonly #translations!: I18n.Locale.Records.Group;

  readonly #onLocaleChange!: I18n.Config['onLocaleChange'];

  #activeLocaleIndex!: number;

  public constructor(config: I18n.Config) {
    const { activeLocaleId } = config;
    const translations: Writable<I18n.Locale.Records.Group> = {};
    const locales: Writable<I18n.Locale.Metadata.List> = [
      getMetadataDefined(config.defaultLocale),
    ];

    for (const locale of config.locales) {
      translations[locale.id] = {
        index: locales.length,
        records: locale.records,
      };

      locales.push(getMetadataDefined(locale));
    }

    this.locales = Object.freeze(locales);
    this.#translations = Object.freeze(translations);
    this.#onLocaleChange = config.onLocaleChange;
    this.#activeLocaleIndex = this.#translations[activeLocaleId || '']?.index ?? 0;

    if (__DEV__) {
      const stat: Partial<Record<keyof I18n.Locale.Metadata.Defined, Record<string, number>>> = {};
      const props: readonly (keyof I18n.Locale.Metadata.Defined)[] = ['id', 'name', 'emoji'];
      const errors: string[] = [];

      for (const locale of this.locales) {
        for (const prop of props) {
          const propStat = stat[prop] ??= {};
          const propValue = locale[prop];

          propStat[propValue] ??= 0;
          propStat[propValue]++;
        }
      }

      for (const [prop, data] of Object.entries(stat)) {
        for (const [value, count] of Object.entries(data)) {
          if (count > 1) {
            errors.push(`${count} locales have the "${prop}" set to "${value}".`);
          }
        }
      }

      if (errors.length > 0) {
        errors.unshift('The locales list is broken. Please fix these issues:');

        throw new Error(errors.join('\n- '));
      }
    }
  }

  public get activeLocale(): I18n.Locale.Metadata.Defined {
    return this.locales[this.#activeLocaleIndex];
  }

  public setActiveLocale(id: I18n.Locale.Id): this {
    let index: number | undefined;

    if (id in this.#translations) {
      index = this.#translations[id].index;
    } else if (id === this.locales[0].id) {
      // The default locale with no translations.
      index = 0;
    }

    if (index !== undefined) {
      this.#activeLocaleIndex = index;
      this.#onLocaleChange?.(id);
    } else if (__DEV__) {
      // eslint-disable-next-line no-console
      console.error(
        `[dev] i18n: The "${id}" locale is undefined.`,
        `Use one of: "${Object.keys(this.#translations).join('", "')}".`,
      );
    }

    return this;
  }

  public getTranslator(): I18n.Translator {
    const translation = this.#translations[this.activeLocale.id];

    const converters: I18n.Translator[] = [
      mustache.render,
    ];

    if (translation) {
      converters.unshift((str) => translation.records[str] || str);
    }

    return (text, params) => converters.reduce(
      (value, convert) => convert(value, params),
      text,
    );
  }
}
