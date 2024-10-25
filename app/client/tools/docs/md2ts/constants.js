import { createRequire } from 'module';

export const module = createRequire(import.meta.url)('./package.json');

export const regexps = {
  metaData: /^---\n([\S\s]*?)\n---/,
  dollarCurlyBracketSequence: /\$\{/g,
  backticks: /`/g,
  trailingSlash: /\/$/,
  trailingSlashDot: /\/\.$/,
  unwrapSlashes: /^\/|\/$/,
  whitespaces: /\s+/g,
  nonWordsOrDashes: /[^\w-]+/g,
  /**
   * The Markdown alert ID matcher.
   *
   * @see https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts
   */
  mdAlertId: /\[!(.*)]\n?/,
  pathPartReadmeMd: /\/readme\.md/i,
};
