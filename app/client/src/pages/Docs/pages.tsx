import React, { lazy } from 'react';
import type { Md2Ts } from 'md2ts';

import { PageMarkdown } from './Markdown';

function now(): number {
  return new Date().getTime();
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export const Pages = Object
  .entries(import.meta.glob('./Build/**/README.ts', { import: 'page' }))
  .reduce(
    (accumulator, [path, load], ) => {
      accumulator[path.replace('./Build', '').replace('/README.ts', '')] = lazy(
        async () => {
          const start = now();
          const page = await load() as Md2Ts.Page;

          await sleep(400 - (now() - start));

          return {
            default: () => <PageMarkdown page={page} />,
          };
        }
      );

      return accumulator;
    },
    {} as Record<string, React.FC>,
  );
