import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import { regexps } from './constants.js';

/**
 * @param {string} command
 *
 * @return {string}
 */
function exec(command) {
  return execSync(command)
    .toString()
    .trim();
}

/**
 * @return {string}
 */
export function getRepoRootDir() {
  return exec('git rev-parse --show-toplevel');
}

/**
 * @param {string} [remoteName]
 *
 * @return {string}
 */
export function getGithubRepoBaseUrl(remoteName) {
  const remote = exec(`git remote get-url ${remoteName || 'origin'}`);
  const url = remote.includes('//')
    // Examples:
    // - `https://github.com/ORG/REPO.git`
    // - `https://github.com/ORG/REPO`
    ? remote
      .split('//')[1]
    // Example: `git@github.com:ORG/REPO.git`.
    : remote
      .replace('git@', '')
      .replace(':', '/');

  return `//${url.replace('.git', '')}/blob/${exec('git rev-parse --abbrev-ref HEAD')}`;
}

/**
 * @param {'info'|'error'|'warn'} type
 * @param {*} args
 */
export function log(type, ...args) {
  // eslint-disable-next-line no-console
  console[type](`==> [${type.toUpperCase()}]`, ...args);
}

/**
 * @param {string} string
 *
 * @return {string}
 */
export function trimTrailingSlash(string) {
  return string.replace(regexps.trailingSlash, '');
}

/**
 * @param {object} target
 * @param {string|undefined} currentPath
 * @param {string[]} path
 * @param {*} value
 */
export function setValueNested(target, [currentPath, ...path], value) {
  if (currentPath !== undefined) {
    if (path.length === 0) {
      target[currentPath] = value;
    } else {
      target[currentPath] ??= {};

      if (target[currentPath] !== null && typeof target[currentPath] === 'object') {
        setValueNested(target[currentPath], path, value);
      }
    }
  }
}

/**
 * @param {object} target
 * @param {string[]} path
 * @param {(item: *) => void} [visit]
 *
 * @return {*}
 */
export function getValueNested(target, path, visit) {
  let value = target;

  for (const item of path) {
    value = value?.[item];
    visit?.(value);
  }

  return value;
}

/**
 * @param {string} elementsSelector
 *
 * @return {{startingFrom: (function(Element): {beforeNext: (function(string): Element[])})}}
 */
export function findAll(elementsSelector) {
  return {
    /**
     * @param {Element} element
     *
     * @return {{beforeNext: (function(stopSelector: string): Element[])}}
     */
    startingFrom: (element) => ({
      /**
       * @param {string} stopSelector
       *
       * @return {Element[]}
       */
      beforeNext: (stopSelector) => {
        const list = [];

        element = element.nextElementSibling;

        while (element && !element.matches(stopSelector)) {
          if (element.matches(elementsSelector)) {
            list.push(element);
          }

          element = element.nextElementSibling;
        }

        return list;
      },
    }),
  };
}

/**
 * @param {HTMLHeadingElement} heading
 * @param {('h4'|'h5'|'h6')} stopAt
 * @param {string} [parentId]
 *
 * @return {Md2Ts.Anchor|null}
 */
export function buildNavigation(heading, stopAt, parentId) {
  const headingSelector = heading.nodeName.toLowerCase();

  if (stopAt === headingSelector) {
    return null;
  }

  const next = `h${Number(heading.nodeName[1]) + 1}`;
  const slug = heading.id || heading
    .textContent
    .toLowerCase()
    .replace(regexps.whitespaces, '-')
    .replace(regexps.nonWordsOrDashes, '');

  // Mutate the element so ID appears in the resulting HTML.
  heading.id = parentId ? `${parentId}--${slug}` : slug;

  return {
    id: heading.id,
    title: heading.textContent,
    children: findAll(next)
      .startingFrom(heading)
      .beforeNext(headingSelector)
      .map((child) => buildNavigation(child, stopAt, heading.id))
      .filter(Boolean),
  };
}

/**
 * @template {string} T
 *
 * @param {T} filepath
 *
 * @return {T}
 */
export function ensureDirSync(filepath) {
  mkdirSync(dirname(filepath), { recursive: true });

  return filepath;
}

/**
 * Removes all nodes in between of the `<!-- ${comment} -->`
 * and `<!-- /${comment} -->` comments.
 *
 * @param {Window} window
 * @param {string} comment
 */
export function stripBetweenComments(window, comment) {
  const commentClosing = `/${comment}`;
  const commentsIterator = window.document.createNodeIterator(
    window.document.body,
    window.NodeFilter.SHOW_COMMENT,
  );

  while (commentsIterator.nextNode()) {
    if (commentsIterator.referenceNode.textContent.trim() === comment) {
      // Delete the comment itself.
      let nodeToRemove = commentsIterator.referenceNode;

      while (nodeToRemove) {
        // Preserve the next sibling before the node is
        // removed as otherwise it will not be available.
        const next = nodeToRemove.nextSibling;

        nodeToRemove.remove();

        if (next?.nodeType === window.Node.COMMENT_NODE && next.textContent.trim() === commentClosing) {
          next.remove();
          // Stop the removal process until the next
          // opening comment is found.
          nodeToRemove = null;
        } else {
          nodeToRemove = next;
        }
      }
    }
  }
}
