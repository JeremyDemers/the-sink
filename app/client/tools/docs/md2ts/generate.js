import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import glob from 'glob';
import { JSDOM } from 'jsdom';

import { module, regexps } from './constants.js';
import {
  buildNavigation,
  ensureDirSync,
  getGithubRepoBaseUrl,
  getRepoRootDir,
  getValueNested,
  setValueNested,
  stripBetweenComments,
} from './functions.js';
import { PathProcessor } from './path.js';
import { md } from './md.js';

const rootUrl = getGithubRepoBaseUrl();
const rootDir = getRepoRootDir();
const metadataId = Symbol('metadata');

/**
 * @param {string} dirSrc
 * @param {string} dirDest
 */
export function generate(dirSrc, dirDest) {
  const dirSrcPrefix = `${dirSrc}/`;
  const basePath = `/${basename(dirDest)}`;
  const structure = {};
  /** @type {Record<string, string[]>} */
  const errors = {};
  const addError = (src, ...lines) => {
    errors[src] ??= [];
    errors[src].push(...lines);
  };

  const files = glob
    .sync(`${dirSrc}/**/**/README.md`, { nosort: false })
    .map((src) => {
      const slug = src.replace(dirSrcPrefix, '');
      const subPath = dirname(slug);
      const markdown = readFileSync(src, 'utf8');
      const metadata = JSON.parse(markdown.match(regexps.metaData)?.[1] ?? '{}');
      const routePath = `${basePath}/${subPath}`.replace(regexps.trailingSlashDot, '');
      const routeLocation = routePath.replace(regexps.unwrapSlashes, '').split('/');
      const dom = new JSDOM(md.render(markdown.replace(regexps.metaData, '')));
      const images = {};
      const pathProcessor = new PathProcessor({
        basePath,
        subPath,
        rootUrl,
        rootDir,
        dir: dirSrc,
        maxDepth: subPath.split('/').length,
      });

      if (!metadata.title) {
        metadata.title = dom.window.document.querySelector('h1')?.textContent;
      }

      if (!metadata.title) {
        addError(src, 'The file must either provide a title via metadata or contain an "h1" element.');
      }

      // Remove the nodes in between of the `<!-- private -->`
      // and `<!-- /private -->` comments.
      stripBetweenComments(dom.window, 'private');

      metadata.breadcrumbs = [];
      metadata.navigation = Array
        .from(dom.window.document.querySelectorAll('h2'))
        .map((heading) => buildNavigation(heading, 'h4'));

      dom.window.document.querySelectorAll('a').forEach((link) => {
        // Not applicable for `#hashed` URLs.
        if (link.href.indexOf('about:') !== 0) {
          const { path, location, error } = pathProcessor.process(link.href);

          if (error) {
            addError(src, error);
          }

          if (location) {
            link.classList.add('inlink');
          } else {
            link.rel = 'noopener noreferrer nofollow';
            link.target = '_blank';
            link.classList.add('extlink');
          }

          link.href = path;
        }
      });

      dom.window.document.querySelectorAll('img[src]').forEach((image, index) => {
        const { location, error } = pathProcessor.process(image.src);

        if (error) {
          addError(src, error);
        }

        if (location) {
          copyFileSync(location, ensureDirSync(`${dirDest}/${location.replace(dirSrcPrefix, '')}`));

          image.id = images[image.src] ??= `img_${index}`;
          image.setAttribute('loading', 'lazy');
        }
      });

      dom.window.document.querySelectorAll('blockquote > p').forEach((quoteParagraph) => {
        if (quoteParagraph.firstChild.nodeName === '#text') {
          // Match the `[!TEXT]` construct.
          const matches = quoteParagraph.firstChild.textContent.match(regexps.mdAlertId);

          if (matches) {
            const type = matches[1].toLowerCase();
            const heading = dom.window.document.createElement('span');

            heading.innerHTML = `<i class="alert-icon"></i>${type[0].toUpperCase() + type.slice(1)}`;
            heading.classList.add('alert-heading');

            // Add a class to the `blockquote` element.
            quoteParagraph.parentNode.classList.add(`alert-${type}`);
            // Replace the paragraph text content with a heading node
            // and an updated text with the heading text excluded.
            quoteParagraph.firstChild.replaceWith(
              heading,
              quoteParagraph.firstChild.textContent.replace(matches[0], ''),
            );
          }
        }
      });

      setValueNested(
        structure,
        routeLocation,
        {
          ...(getValueNested(structure, routeLocation) || {}),
          [metadataId]: {
            link: {
              path: routePath,
              title: metadata.title,
            },
          },
        },
      );

      return {
        src,
        dest: `${dirDest}/${slug.replace('.md', '.ts')}`,
        markup: dom.window.document.body.innerHTML
          .replaceAll(regexps.backticks, '\\`')
          .replaceAll(regexps.dollarCurlyBracketSequence, '\\${'),
        images: Object.entries(images),
        getMetadata: () => {
          getValueNested(
            structure,
            routeLocation,
            (child) => {
              // There might be a case when a directory contains only directories.
              if (child[metadataId]) {
                metadata.breadcrumbs.push(child[metadataId].link);
              }
            },
          );

          // The page title is available in the last breadcrumb.
          delete metadata.title;

          return metadata;
        },
      };
    })
    .map((item) => {
      writeFileSync(
        ensureDirSync(item.dest),
        [
          '/* eslint-disable */',
          `import type { Md2Ts } from '${module.name}';`,
          ...item.images.map(([src, id]) => `import ${id} from './${src}';`),
          '',
          'export const page: Md2Ts.Page = {',
          `  html: \`${item.markup}\`,`,
          `  images: { ${item.images.map(([, id]) => id).join(', ')} },`,
          `  metadata: ${JSON.stringify(item.getMetadata(), null, 2)},`,
          '};',
          '',
        ].join('\n'),
      );

      return item;
    });

  return {
    size: files.length,
    errors: Object.entries(errors),
  };
}
