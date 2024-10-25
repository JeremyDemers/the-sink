#!/usr/bin/env node
import { ArgumentParser } from 'argparse';

import { module } from './constants.js';
import { log, trimTrailingSlash } from './functions.js';
import { generate } from './generate.js';
import { Path } from './path.js';

const parser = new ArgumentParser({
  prog: module.name,
  description: module.description,
});

parser.add_argument(
  'src',
  {
    type: trimTrailingSlash,
    help: 'the path to directory with Markdown',
  },
);

parser.add_argument(
  'dest',
  {
    type: trimTrailingSlash,
    help: 'the path to directory where generated code should be stored',
  },
);

const { src, dest } = parser.parse_args();

if (Path.isExistingDir(src)) {
  const result = generate(src, dest);

  if (result.errors.length > 0) {
    for (const [src, messages] of result.errors) {
      log('error', Path.resolve(src));

      for (const message of messages) {
        log('error', `  - ${message}`);
      }

      // eslint-disable-next-line no-console
      console.error('');
    }

    process.exit(1);
  }

  log('info', `Processed ${result.size} files.`);
} else {
  log('warn', `The "${src}" source directory does not exist. Skipping.`);
}
