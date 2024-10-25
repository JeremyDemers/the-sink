# Internationalization

Wrap a string literal into the `t()` function to make it translatable.

The locale-specific string is handled by the [Mustache.js](https://github.com/janl/mustache.js). Here are some samples:

### Parametrization

```typescript
// Returns `Hi Rob`.
t(
  'Hi {{ person.names.first }}',
  {
    person: {
      names: {
        first: 'Rob',
      },
    },
  },
);
```

### Conditionals

```typescript
// Returns `Hi Bob Dilan`.
t(
  'Hi {{ firstName }}{{#lastName}}{{ lastName }}{{/lastName}}',
  {
    firstName: 'Bob',
    lastName: 'Dilan',
  },
);
```

```typescript
// Returns `Hi Bob`.
t(
  'Hi {{ firstName }}{{#lastName}}{{ lastName }}{{/lastName}}',
  {
    firstName: 'Bob',
  },
);
```

Refer to the [Mustache.js](https://github.com/janl/mustache.js) documentation for more.

> [!CAUTION]
> The `t()` function accepts only a string literal with no JavaScript computing allowed.
>
> ```typescript
> const text = 'Hello {{ name }}!';
>
> t(text, { name: 'Joe' });
> ```
>
> The example above will cause the following error during the run of an ESLint:
>
> ```
> Avoid using string interpolation to construct translation keys. Consider using a `switch` statement instead  slw/no-translation-key-interpolation
> ```
>
> Instead, place the literal directly:
>
> ```typescript
> t('Hello {{ name }}!', { name: 'Joe' });
> ```

## Add a new locale

- Create a `[LOCALE_ID].json` in the `app/client/src/lang`. For instance:
  
  ```bash
  cd /path/to/project
  touch app/client/src/lang/fr-FR.json
  ```

- Collect all strings wrapped in `t()` by running the ESLint:
  ```bash
  slw exec client npm run eslint
  ```

  > The ESLint creates an [Abstract Syntax Tree (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) of the entire codebase allowing to know all calls of the `t()` function.

- Open the `app/client/src/lang/fr-FR.json` and add the translations as values to the record:
  ```json
  {
    "Hello {{ name }}!": "Bonjour {{ name }}!"
  }
  ```

- Go to `app/client/plugins/i18n/index.ts` to:
  - import the newly added locale at the top of the file:
    ```typescript
    import frFR from '@lang/fr-FR.json';
    ```

  - add the locale to the locales record:
    ```typescript
      locales: [
        {
          id: 'fr-FR',
          name: 'French (Français)',
          records: frFR,
        },
      ],
    ```

## Update the localization files

```bash
slw exec client npm run eslint
```

Run the above command to update all JSON files inside the `app/client/src/lang`. Assert the diff. Provide translations.

## Change the UI language

The language switcher will appear in the site footer once there are more than one locale added.
