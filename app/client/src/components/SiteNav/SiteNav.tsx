import React, { forwardRef, useContext } from 'react';
import { NavLink } from 'react-router-dom';

import { AuthContext } from '@context/AuthProvider';

import { Nav } from './types';

import './SiteNav.scss';

interface SiteNavProps {
  readonly links: readonly Nav.Link[];
}

/**
 * The list of suffixes that should be sequentially removed from the route path.
 *
 * @example
 * ```typescript
 * // Returns `/docs`.
 * toCanonical('/docs*');
 *
 * // Returns `/docs`.
 * toCanonical('/docs/*');
 * ```
 */
const suffixes = [
  '*',
  '/',
] as const;

function toCanonical(path: string): string {
  if (__DEV__ && !path.trim()) {
    throw new Error('The link path cannot be empty.');
  }

  for (const suffix of suffixes) {
    if (path.endsWith(suffix)) {
      path = path.slice(0, -suffix.length);
    }
  }

  if (!path) {
    path = suffixes[suffixes.length - 1];
  }

  if (__DEV__ && (path.includes('*') || path.includes(':'))) {
    throw new Error(`The "${path}" path cannot contain unresolved route parameters.`);
  }

  return path;
}

export const SiteNav = forwardRef<HTMLDivElement | null, SiteNavProps>(
  (
    {
      links,
    },
    ref,
  ) => {
    const authContext = useContext(AuthContext);
    const linkElements: React.ReactNode[] = [];

    for (const link of links) {
      if (authContext.hasAccess(link.route)) {
        linkElements.push(
          <NavLink key={link.route.path} to={toCanonical(link.route.path)}>
            {link.title}
          </NavLink>,
        );
      }
    }

    return linkElements.length === 0 ? null : (
      <nav className="site-nav" ref={ref}>
        {linkElements}
      </nav>
    );
  },
);
