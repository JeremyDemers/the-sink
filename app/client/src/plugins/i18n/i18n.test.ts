import { formatArgs } from '@tests/jestUtils/runner';

import { Internationalization, type I18n } from '.';

describe('@plugins/i18n', () => {
  const localeUkUa: I18n.Locale.Definition = {
    id: 'uk-UA',
    name: 'Ukrainian',
    records: {
      'Hi there!': 'Привіт!',
      'Howdy?': 'Як справи?',
      'Hi {{ firstName }}{{#lastName}} {{ lastName }}{{/lastName}}!': 'Привіт, {{ firstName }}{{#lastName}} {{ lastName }}{{/lastName}}!',
    },
  };

  const i18n = new Internationalization({
    activeLocaleId: 'uk-UA',
    defaultLocale: {
      id: 'en-US',
      name: 'English (US)',
    },
    locales: [
      localeUkUa,
      {
        id: 'fr-FR',
        name: 'French',
        records: {
          'Hi there!': 'Bonjour!',
          'Howdy?': 'Comment ça va?',
          'Hi {{ firstName }}{{#lastName}} {{ lastName }}{{/lastName}}!': 'Bonjour {{ firstName }}{{#lastName}} {{ lastName }}{{/lastName}}!',
        },
      },
    ],
  });

  describe('integrity', () => {
    it('should forbid non-unique locales', () => {
      const config: I18n.Config = {
        defaultLocale: i18n.locales[0],
        activeLocaleId: i18n.activeLocale.id,
        locales: [
          localeUkUa,
          localeUkUa,
        ],
      } as const;

      const errorLines = [
        'The locales list is broken. Please fix these issues:',
        '2 locales have the "id" set to "uk-UA".',
        '2 locales have the "name" set to "Ukrainian".',
        '2 locales have the "emoji" set to "🇺🇦".',
      ] as const;

      expect(() => new Internationalization(config)).toThrow(new Error(errorLines.join('\n- ')));
    });
  });

  describe('translation', () => {
    const testCases: ReadonlyArray<
      readonly [
        args: Parameters<I18n.Translator>,
        expectations: readonly [localeId: I18n.Locale.Id, expected: string][]
      ]
    > = [
      // No translation for this string - expect as is.
      [
        ['Hello'],
        [
          ['uk-UA', 'Hello'],
          ['fr-FR', 'Hello'],
        ],
      ],
      [
        ['Hi there!'],
        [
          ['uk-UA', 'Привіт!'],
          ['fr-FR', 'Bonjour!'],
        ],
      ],
      [
        ['Howdy?'],
        [
          ['uk-UA', 'Як справи?'],
          ['fr-FR', 'Comment ça va?'],
        ],
      ],
      [
        ['Hi {{ firstName }}{{#lastName}} {{ lastName }}{{/lastName}}!', { firstName: 'Сергій' }],
        [
          ['uk-UA', 'Привіт, Сергій!'],
          ['fr-FR', 'Bonjour Сергій!'],
        ],
      ],
      [
        ['Hi {{ firstName }}{{#lastName}} {{ lastName }}{{/lastName}}!', { firstName: 'Сергій', lastName: 'Бондаренко' }],
        [
          ['uk-UA', 'Привіт, Сергій Бондаренко!'],
          ['fr-FR', 'Bonjour Сергій Бондаренко!'],
        ],
      ],
    ];

    for (const [args, expectations] of testCases) {
      for (const [localeId, expected] of expectations) {
        const translator = i18n
          .setActiveLocale(localeId)
          .getTranslator();

        it(`t(${formatArgs(args)}) should return "${expected}" for "${localeId}" locale`, () => {
          expect(translator(...args)).toBe(expected);
        });
      }
    }
  });
});
