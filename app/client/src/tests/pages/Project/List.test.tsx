import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, render, screen, waitFor } from '@testing-library/react';

import type { ModelListResponse } from '@typedef/models';
import type { Primitive } from '@typedef/global';

import { AuthContext } from '@context/AuthProvider';
import { t } from '@plugins/i18n';
import AuthContextStub from '@tests/jestUtils/authContext';

import ProjectModel, { ProjectStatus } from '@models/Project';
import { ProjectsListPage } from '@models/Project/pages/ProjectsListPage';

vi.mock('@models/Project', async (importOriginal) => {
  const original = await importOriginal<Any>();

  return {
    ...original,
    default: {
      ...original.default,
      list: async (): Promise<ModelListResponse<typeof ProjectModel>> =>
        new Promise<ModelListResponse<typeof ProjectModel>>((resolve) => resolve({
          items: [
            {
              id: 1,
              title: 'Project 1',
              status: 'draft',
              created_at: '2024-07-29T13:18:16.597519' as Primitive.DateTime,
              updated_at: '2024-08-30T09:21:33.933772' as Primitive.DateTime,
              author: {
                id: 1,
                name: 'Jon Doe',
              },
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
      <ProjectsListPage model={ProjectModel} />
    </MemoryRouter>
  </AuthContext.Provider>
);

describe(ProjectsListPage, () => {
  it('should render ModelTable with correct columns', async () => {
    vi.useFakeTimers();
    const { container } = renderList();

    await act(() => {
      vi.runAllTicks();
    });

    expect(Array.from(container.querySelectorAll('th')).map((column) => column.className)).toStrictEqual([
      'title',
      'author_name',
      'status',
      'created_at',
      'updated_at',
      'action',
    ]);
  });

  it('should display create new link', async () => {
    vi.useRealTimers();
    renderList();

    await waitFor(() => {
      expect(screen.queryByText(t('Projects'), { selector: 'h2' })).toBeInTheDocument();
      expect(screen.queryByText(t('Create new project'))).toBeInTheDocument();
    });
  });

  it('should not display create new link', async () => {
    vi.useRealTimers();
    renderList('', false);

    await waitFor(() => {
      expect(screen.queryByText(t('Projects'), { selector: 'h2' })).toBeInTheDocument();
      expect(screen.queryByText(t('Create new project'))).not.toBeInTheDocument();
    });
  });

  it('should display different title for the archived tab', async () => {
    vi.useRealTimers();
    renderList(`/?status_filter=${ProjectStatus.Archived}`);

    await waitFor(() => {
      expect(screen.queryByText(t('Archived projects'), { selector: 'h2' })).toBeInTheDocument();
      expect(screen.queryByText(t('Create new project'))).toBeInTheDocument();
    });
  });
});
