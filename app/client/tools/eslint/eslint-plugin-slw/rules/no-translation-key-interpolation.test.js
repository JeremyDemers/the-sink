import { RuleTester } from 'eslint';

import noTranslationKeyInterpolation from './no-translation-key-interpolation';

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

const configFile = `${__dirname}/__fixtures__/l10n.example.json`;

const errors = [
  {
    message: noTranslationKeyInterpolation.meta.messages.error,
  },
];


for (const functions of [
  // eslint-disable-next-line global-require, import/no-dynamic-require
  require(configFile).config.funcs,
  `file:${configFile}:config.funcs`,
]) {
  const options = [
    {
      functions,
    },
  ];

  ruleTester.run(
    `slw/no-translation-key-interpolation#create(${JSON.stringify(options)})`,
    noTranslationKeyInterpolation,
    {
      valid: [
        {
          code: 'this.$t("key1");',
          options,
        },
        {
          code: "$t('key2');",
          options,
        },
        {
          code: "t('key3');",
          options,
        },
      ],
      invalid: [
        {
          code: "const variable = 'key'; this.$t(variable);",
          options,
          errors,
        },
        {
          code: "const variable = 'key'; $t(variable);",
          options,
          errors,
        },
        {
          code: "const variable = 'key'; t(variable);",
          options,
          errors,
        },
        {
          code: "t('key3' + 'key4');",
          options,
          errors,
        },
        {
          code: 't(`key`);',
          options,
          errors,
        },
      ],
    },
  );
}
