import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, render, screen, waitFor } from '@testing-library/react';

import type { ModelListResponse } from '@typedef/models';
import type { Primitive } from '@typedef/global';

import { AuthContext } from '@context/AuthProvider';
import { t } from '@plugins/i18n';
import AuthContextStub from '@tests/jestUtils/authContext';

import UserModel, { UserRole } from '@models/User';
import { UsersListPage } from '@models/User/pages/UsersListPage';

vi.mock('@models/User', async (importOriginal) => {
  const original = await importOriginal<Any>();

  return {
    ...original,
    default: {
      ...original.default,
      list: async (): Promise<ModelListResponse<typeof UserModel>> =>
        new Promise<ModelListResponse<typeof UserModel>>((resolve) => resolve({
          items: [
            {
              id: 1,
              name: 'Jon Doe',
              email: 'jon.doe@gmail.com',
              role: UserRole.Authenticated,
              is_active: true,
              created_at: '2024-07-29T13:18:16.597519' as Primitive.DateTime,
              updated_at: '2024-08-30T09:21:33.933772' as Primitive.DateTime,
            },
          ],
          sort: [],
          filters: {},
          pager: {
            page: 1,
            total: 1,
            per_page: 1,
          },
        })),
    },
  };
});

const renderList = (urlQuery?: string, can = true) => render(
  <AuthContext.Provider value={{ ...AuthContextStub, hasAccess: () => can }}>
    <MemoryRouter initialEntries={urlQuery ? [urlQuery] : undefined}>
      <UsersListPage model={UserModel} />
    </MemoryRouter>
  </AuthContext.Provider>
);

describe(UsersListPage, () => {
  it('should render ModelTable with correct columns', async () => {
    vi.useFakeTimers();
    const { container } = renderList();

    await act(() => {
      vi.runAllTicks();
    });

    expect(Array.from(container.querySelectorAll('th')).map((column) => column.className)).toStrictEqual([
      'name',
      'email',
      'role',
      'created_at',
      'updated_at',
      'action'
    ]);
  });

  it('should display create new link', async () => {
    vi.useRealTimers();
    renderList();

    await waitFor(() => {
      expect(screen.queryByText(t('Users'), { selector: 'h2' })).toBeInTheDocument();
      expect(screen.queryByText(t('Create new user'))).toBeInTheDocument();
    });
  });

  it('should not display create new link', async () => {
    vi.useRealTimers();
    renderList('', false);

    await waitFor(() => {
      expect(screen.queryByText(t('Users'), { selector: 'h2' })).toBeInTheDocument();
      expect(screen.queryByText(t('Create new user'))).not.toBeInTheDocument();
    });
  });

  it('should display different title for the blocked tab', async () => {
    vi.useRealTimers();
    renderList('/?status_filter=0');

    await waitFor(() => {
      expect(screen.queryByText(t('Blocked users'), { selector: 'h2' })).toBeInTheDocument();
      expect(screen.queryByText(t('Create new user'))).toBeInTheDocument();
    });
  });
});
