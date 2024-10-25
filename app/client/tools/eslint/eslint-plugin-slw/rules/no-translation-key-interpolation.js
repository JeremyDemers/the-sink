const assert = require('node:assert');
const { readFileSync, writeFileSync } = require('node:fs');

const { Legacy } = require('@eslint/eslintrc');
const glob = require('glob');

/**
 * @type {{dir: undefined | string, strings: Set<string>}}
 */
const translations = {
  /**
   * The path to directory with `*.json` files (the file name is a langcode).
   */
  dir: undefined,
  /**
   * The unique set of translatable strings.
   */
  strings: new Set(),
};

/**
 * @param {Object|Array} object
 * @param {Array<string|number>} pointers
 *
 * @return {*}
 */
function getNestedValue(object, pointers) {
  let result = object;

  for (const pointer of pointers) {
    // Either an array index or an object key.
    assert(pointer in result, pointer.toString());
    result = result[pointer];
    // Either an array or object.
    assert(result && typeof result === 'object', pointer.toString());
  }

  return result;
}

/**
 * @template T
 *
 * @param {string} path
 * @param {() => T} getDefault
 *
 * @return {T}
 */
function loadJson(path, getDefault) {
  try {
    return JSON.parse(readFileSync(path, { encoding: 'utf-8' }).toString());
  } catch {
    return getDefault();
  }
}

process.on('beforeExit', () => {
  if (translations.dir) {
    // Find the translations.
    for (const langFile of glob.sync(`${translations.dir}/*.json`)) {
      const existingTranslations = loadJson(langFile, () => ({}));

      // Delete the keys that are no longer in the interface.
      for (const key of Object.keys(existingTranslations)) {
        if (!translations.strings.has(key)) {
          delete existingTranslations[key];
        }
      }

      // Append the keys that have to be translated.
      for (const key of translations.strings) {
        existingTranslations[key] ??= '';
      }

      writeFileSync(
        langFile,
        JSON.stringify(existingTranslations, null, 2) + '\n',
      );
    }
  }
});

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow string interpolation in translation keys.',
      category: 'i18n',
    },
    schema: [
      {
        type: 'object',
        required: [
          'functions',
        ],
        properties: {
          functions: {
            oneOf: [
              {
                type: 'array',
                minItems: 1,
                items: {
                  type: 'string',
                  minLength: 1,
                },
              },
              {
                type: 'string',
                pattern: '^file:.+?.json:.*$',
              },
            ],
          },
          languagesDir: {
            type: 'string',
            minLength: 3,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      error: [
        'Avoid using string interpolation to construct translation keys.',
        'Consider using a `switch` statement instead.',
      ].join(' '),
    },
  },
  create(context) {
    const { functions, languagesDir } = context.options[0];
    const funcNames = [];

    if (typeof functions === 'string') {
      // Example: `file:./l10n.json:config.functions`.
      const [, configPath, location] = functions.split(':');
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const config = require(
        configPath.startsWith('./')
          ? `${context.getCwd()}/${configPath}`
          : configPath,
      );

      funcNames.push(...getNestedValue(config, location.split('.')));

      // Validate the function names read from the file.
      new Legacy.ConfigValidator().validateRuleSchema(
        module.exports,
        [
          {
            functions: funcNames,
          },
        ],
      );
    } else {
      funcNames.push(...functions);
    }

    translations.dir ??= languagesDir;
    assert(translations.dir === languagesDir, 'The "languagesDir" must not mutate!');

    return {
      CallExpression(node) {
        if (
          node.arguments.length > 0
          && (
            // this.t(...)
            (node.callee.type === 'MemberExpression' && funcNames.includes(node.callee.property.name))
            // t(...)
            || (node.callee.type === 'Identifier' && funcNames.includes(node.callee.name))
          )
        ) {
          if (
            node.arguments[0].type !== 'Literal'
            || node.arguments[0].type === 'TemplateLiteral'
          ) {
            context.report({
              node,
              messageId: 'error',
            });
          } else if (languagesDir) {
            translations.strings.add(node.arguments[0].value);
          }
        }
      },
    };
  },
};
