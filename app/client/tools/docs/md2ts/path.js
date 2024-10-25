import { existsSync, lstatSync } from 'node:fs';
import { resolve } from 'node:path';

import { regexps } from './constants.js';

export class Path {
  /**
   * @param {string} path
   *
   * @return {string}
   */
  static resolve(path) {
    return resolve(path);
  }

  /**
   * @param {string} path
   *
   * @return {boolean}
   */
  static isRelativeRoot(path) {
    return path.startsWith('/');
  }

  /**
   * @param {string} path
   *
   * @return {boolean}
   */
  static isRelativeBack(path) {
    return path.startsWith('..');
  }

  /**
   * @param {string} path
   *
   * @return {boolean}
   */
  static isRelative(path) {
    return (
      path.indexOf('http') !== 0 &&
      path.indexOf('//') !== 0 &&
      path.indexOf('#') !== 0 &&
      path.indexOf('mailto') !== 0
    );
  }

  /**
   * @param {string} path
   *
   * @return {boolean}
   */
  static isExistingDir(path) {
    return !!lstatSync(path, { throwIfNoEntry: false })?.isDirectory();
  }

  /**
   * @param {string} chunks
   *
   * @return {boolean}
   */
  static isValid(...chunks) {
    return existsSync(this.fromChunks(...chunks).split('#')[0].split('?')[0]);
  }

  /**
   * @param {string} path
   * @param {boolean} [resolve=false]
   *
   * @return {string[]}
   */
  static toChunks(path, resolve = false) {
    return (resolve ? this.resolve(path) : path).split('/');
  }

  /**
   * @param {string} parts
   *
   * @return {string}
   */
  static fromChunks(...parts) {
    return parts.join('/');
  }

  /**
   * @param {string} path
   * @param {string} error
   *
   * @return {Md2Ts.Path.Invalid}
   */
  static invalid(path, error) {
    return {
      path,
      error: `The "${path}" path is invalid. ${error}`,
    };
  }

  /**
   * @param {string} path
   * @param {string} location
   *
   * @return {Md2Ts.Path.Internal}
   */
  static internal(path, location) {
    return {
      path,
      location,
    };
  }

  /**
   * @param {string} path
   * @param {boolean} own
   *
   * @return {Md2Ts.Path.External}
   */
  static external(path, own) {
    return {
      path,
      own,
    };
  }
}

export class PathProcessor {
  /**
   * @type {Md2Ts.Path.Processor.Config}
   */
  #config;

  /**
   * @param {Md2Ts.Path.Processor.Config} config
   */
  constructor(config) {
    this.#config = config;
  }

  /**
   * @param {string} path
   *
   * @return {Md2Ts.Path.Processed}
   */
  process(path) {
    if (regexps.pathPartReadmeMd.test(path)) {
      return Path.invalid(path, 'Remove the "/README.md" from path.');
    }

    // Handle the relative path that points to the repo root.
    if (Path.isRelativeRoot(path)) {
      const chunks = Path.toChunks(path, true);

      // Try transforming the repo-root path to relative.
      for (const chunk of Path.toChunks(this.#config.dir, true)) {
        if (chunks[0] === chunk) {
          chunks.shift();
        }
      }

      const location = Path.fromChunks(this.#config.dir, ...chunks);

      if (Path.isValid(location)) {
        return Path.internal(Path.fromChunks(this.#config.basePath, ...chunks), location);
      }

      if (Path.isValid(this.#config.rootDir + path)) {
        return Path.external(Path.fromChunks(this.#config.rootUrl + path), true);
      }

      return Path.invalid(path, 'The file/dir does not exist.');
    }

    if (Path.isRelative(path)) {
      const chunks = [];

      // Process the `href` attribute that starts by `../`.
      if (Path.isRelativeBack(path)) {
        const parts = Path.toChunks(path);
        const backDepth = parts
          .filter(Path.isRelativeBack)
          .length;

        // Check whether the `href` is out of allowed depth.
        // For example:
        // - the `../../path/to/dir` will result in depth `2`;
        // - if the `href` has something like `../../../path/to/dir`
        //   then its depth will exceed allowed value.
        if (backDepth > this.#config.maxDepth) {
          return Path.invalid(path, `The back depth of a path is ${backDepth} while the max is ${this.#config.maxDepth}.`);
        }

        chunks.push(
          ...Path.toChunks(this.#config.subPath).slice(0, -backDepth),
          ...parts.slice(backDepth),
        );
      } else {
        if (this.#config.subPath !== '.') {
          chunks.push(this.#config.subPath);
        }

        if (path) {
          chunks.push(path);
        }
      }

      const location = Path.fromChunks(this.#config.dir, ...chunks);

      if (Path.isValid(location)) {
        return Path.internal(Path.fromChunks(this.#config.basePath, ...chunks), location);
      }

      return Path.invalid(path, 'The file/dir does not exist.');
    }

    return Path.external(path, false);
  }
}
