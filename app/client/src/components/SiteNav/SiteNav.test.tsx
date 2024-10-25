import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { AuthUser } from '@typedef/auth';

import { AuthContext, hasAccess } from '@context/AuthProvider';

import AuthContextStub from '@tests/jestUtils/authContext';
import { getAuthUser } from '@tests/jestUtils/authUser';

import { SiteNav, type Nav } from '.';

const authUser: AuthUser = getAuthUser();
const noopComponent = () => null;
const menuItemsDefault: readonly Nav.Link[] = [
  {
    title: 'menu #1',
    route: {
      path: '/menu-link-1',
      component: noopComponent,
    },
  },
  {
    title: 'menu #2',
    route: {
      path: '/menu-link-2',
      component: noopComponent,
    },
  },
];

const renderComponent = (menuItems: readonly Nav.Link[]) => render(
  <AuthContext.Provider value={{ ...AuthContextStub, hasAccess: hasAccess.bind(null, authUser) }}>
    <BrowserRouter>
      <SiteNav links={menuItems} />
    </BrowserRouter>
  </AuthContext.Provider>
);

describe(SiteNav, () => {
  function assertLinks(
    menuItems: readonly Nav.Link[],
    expected: readonly [href: string, title: string][] | null,
  ): void {
    const { container } = renderComponent(menuItems);

    if (expected === null) {
      expect(container.innerHTML).toBe('');
    } else {
      const links = screen.getAllByRole('link');

      expect(links).toHaveLength(expected.length);

      expected.forEach(([href, title], index) => {
        const link = links[index];

        expect(link).toHaveAttribute('href', href);
        expect(link).toHaveTextContent(title);
      });
    }
  }

  it('should not be rendered without links', () => {
    assertLinks([], null);
  });

  it('should render menu items', () => {
    assertLinks(
      menuItemsDefault,
      [
        ['/menu-link-1', 'menu #1'],
        ['/menu-link-2', 'menu #2'],
      ],
    );
  });

  it('should contain an active class', async () => {
    renderComponent(menuItemsDefault);

    const link = screen.getByText('menu #1');

    expect(link).not.toHaveClass('active');

    await userEvent.click(link);

    expect(link).toHaveClass('active');
  });

  it('should check current user access to the given link' , () => {
    assertLinks(
      [
        {
          title: 'Project add',
          route: {
            path: '/projects/add',
            component: noopComponent,
            constraints: {
              permission: 'create projects',
            },
          },
        },
        {
          title: 'View projects',
          route: {
            path: '/projects',
            component: noopComponent,
            constraints: {
              permission: 'view projects',
            },
          },
        },
        {
          title: 'Home',
          route: {
            path: '/',
            component: noopComponent,
          },
        },
      ],
      [
        ['/projects', 'View projects'],
        ['/', 'Home'],
      ],
    );
  });

  it('should canonicalize URLs', () => {
    assertLinks(
      [
        {
          title: 'Link 1',
          route: {
            path: '/*',
            component: noopComponent,
          },
        },
        {
          title: 'Link 2',
          route: {
            path: '/docs*',
            component: noopComponent,
          },
        },
        {
          title: 'Link 3',
          route: {
            path: '/docs/*',
            component: noopComponent,
          },
        },
        {
          title: 'Link 4',
          route: {
            path: '/docs/',
            component: noopComponent,
          },
        },
      ],
      [
        ['/', 'Link 1'],
        ['/docs', 'Link 2'],
        ['/docs', 'Link 3'],
        ['/docs', 'Link 4'],
      ],
    );
  });
});
