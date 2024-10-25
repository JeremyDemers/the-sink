import React from 'react';
import { Form, Formik } from 'formik';
import { type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TestModel from '@tests/jestUtils/testModel/Model';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-toastify';
import { ModelTable } from '@components/Tables/ModelTable';
import { t } from '@plugins/i18n';
import FormItem from '@components/Form/elements/FormItem';
import InputField from '@components/Form/elements/InputField';
import type { EntityFiltersType } from '@typedef/models';
import type { FilterFormProps } from '@typedef/table';
import AuthContextStub from '@tests/jestUtils/authContext';
import { AuthContext } from '@context/AuthProvider';

vi.mock('@tests/jestUtils/testModel/Model', async (importOriginal) => ({
  default: {
    // @ts-expect-error TS2571
    ...(await importOriginal()).default,
    list: vi.fn(),
  },
}));

vi.mock('react-toastify');

const mockResponse = {
  items: [
    { id: 1, title: 'first', status: 'active' },
  ],
  pager: {
    page: 1,
    total: 2,
    per_page: 1,
  },
  sort: [],
  filters: {},
};

const TestModelFilterForm: React.FC<FilterFormProps<typeof TestModel>> = ({
  config,
  filters,
  isLoading,
}) => {
  return (
    <Formik<EntityFiltersType<typeof TestModel>>
      {...config}
      initialValues={{ title_filter: '', ...filters, }}
    >
      {({ dirty }) => (
        <Form aria-label="form">
          <FormItem<typeof InputField>
            name="title_filter"
            label="Title filter"
            component={InputField}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="btn btn--secondary"
            disabled={isLoading || !dirty}
          >
            {t('Apply')}
          </button>
          <button
            type="reset"
            className="btn btn--reset ms-md-3"
            onClick={() => config.resetForm(filters)}
            disabled={isLoading}
          >
            {t('Reset')}
          </button>
        </Form>
      )}
    </Formik>
  );
};

const renderModelTable = (urlQuery?: string, can = true) => (
  render(
    <AuthContext.Provider value={{ ...AuthContextStub, hasAccess: () => can }}>
      <MemoryRouter initialEntries={urlQuery ? [urlQuery] : undefined}>
        <ModelTable<typeof TestModel>
          filterForm={TestModelFilterForm}
          pageTabs={[
            {
              id: 'active',
              title: 'Active',
            },
            {
              id: 'inactive',
              title: t('Inactive'),
              params: {
                status_filter: 'inactive',
              },
            },
          ]}
          pageTitle="Test Model"
          createNewLink="Create new test model"
          model={TestModel}
          fetchErrorMsg="Cannot fetch test models list."
          noResults="No test models."
          columns={[
            {
              accessorKey: 'title',
              header: 'Title',
            }
          ]}
        />
      </MemoryRouter>
    </AuthContext.Provider>
  )
);

describe(ModelTable, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (TestModel.list as Mock).mockResolvedValue(mockResponse);
  });

  it('should show is loading', async () => {
    renderModelTable();
    await waitFor(() => {
      expect(screen.getByText(t('Loading...'))).toBeInTheDocument();
    });
  });

  it('should render list items', async () => {
    renderModelTable();

    await waitFor(() => {
      expect(TestModel.list).toHaveBeenCalled();
    });
    expect(screen.getByText(mockResponse.items[0].title)).toBeInTheDocument();
    // Pager has been rendered.
    expect(screen.getByText(1)).toBeInTheDocument();
    expect(screen.getByText(2)).toBeInTheDocument();
  });

  it('should render no results message when there are no results', async () => {
    (TestModel.list as Mock).mockResolvedValue({ ...mockResponse, items: [] });
    renderModelTable();

    await waitFor(() => {
      expect(screen.getByText('No test models.')).toBeInTheDocument();
    });
  });

  it('should render add test model button', async () => {
    renderModelTable();

    await waitFor(() => {
      expect(screen.getByText('Create new test model')).toBeInTheDocument();
    });
  });

  it('should re-fetch the list when new sort has been applied or page selected', async () => {
    renderModelTable();

    await waitFor(() => {
      expect(TestModel.list).toHaveBeenCalledTimes(1);
    });

    // Apply title sorting.
    const title = screen.getByText('Title');
    await userEvent.click(title);

    await waitFor(() => {
      const params = (TestModel.list as Mock).mock.calls[1][0];
      const expectedParams = new URLSearchParams('sort=title&desc=false');

      expect(params.toString()).toBe(expectedParams.toString());
    });

    // Click on the second page link.
    await waitFor(() => {
      expect(screen.getByText(2)).toBeInTheDocument();
    });
    const secondPage = screen.getByText(2);
    await userEvent.click(secondPage);

    await waitFor(() => {
      const params = (TestModel.list as Mock).mock.calls[2][0];
      const expectedParams = new URLSearchParams('sort=title&desc=false&page=2');

      expect(params.toString()).toBe(expectedParams.toString());
    });
  });

  it('should show error message when api is not available', async () => {
    (TestModel.list as Mock).mockRejectedValue(new Error('API Is Down'));
    renderModelTable();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Cannot fetch test models list.');
    });
  });

  it('should use search params from URL for the initial request', async () => {
    renderModelTable('/users?sort=title&desc=false');

    await waitFor(() => {
      const params = (TestModel.list as Mock).mock.calls[0][0];
      const expectedParams = new URLSearchParams('sort=title&desc=false');

      expect(params.toString()).toBe(expectedParams.toString());
    });
  });

  describe('FilterForm', () => {
    it('should render form with all inputs and buttons', async () => {
      renderModelTable();

      await waitFor(() => {
        expect(TestModel.list).toHaveBeenCalled();
      });

      expect(screen.getByRole('textbox', { name: 'Title filter' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: t('Reset') })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: t('Apply') })).toBeInTheDocument();
    });

    it('should prefill input values', async () => {
      const responseWithFilters = {
        ...mockResponse,
        filters: {
          title_filter: 'value1',
        }
      };
      (TestModel.list as Mock).mockResolvedValue(responseWithFilters);
      renderModelTable();

      await waitFor(() => {
        expect(TestModel.list).toHaveBeenCalled();
      });

      // Wait for formik re-render.
      await waitFor(() => {
        expect(screen.getByDisplayValue('value1')).toHaveAttribute('name', 'title_filter');
      });
    });

    it('should clear filters on form reset and trigger table update', async () => {
      const responseWithFilters = {
        ...mockResponse,
        filters: {
          title_filter: 'value1',
        }
      };
      (TestModel.list as Mock).mockResolvedValue(responseWithFilters);
      renderModelTable('/users?sort=title&desc=false&title_filter=value1');

      await waitFor(() => {
        expect(TestModel.list).toHaveBeenCalled();
      });

      (TestModel.list as Mock).mockResolvedValue(mockResponse);
      const reset = screen.getByRole('button', { name: t('Reset') });
      await userEvent.click(reset);

      // TestModel should not receive any filters params.
      await waitFor(() => {
        const params = (TestModel.list as Mock).mock.calls[1][0];
        const expectedParams = new URLSearchParams('sort=title&desc=false');
        expect(params.toString()).toBe(expectedParams.toString());
      });

      // Title filter should be cleared.
      await waitFor(() => {
        const title = screen.getByRole('textbox', { name: 'Title filter' });
        expect(title).toHaveValue('');
      });
    });

    it('should update table on filter form submit', async () => {
      renderModelTable();
      await waitFor(() => {
        expect(TestModel.list).toHaveBeenCalled();
      });

      const title = screen.getByRole('textbox', { name: 'Title filter' });
      const submit = screen.getByRole('button', { name: t('Apply') });

      await userEvent.type(title, 'filterValue');
      await userEvent.click(submit);

      await waitFor(() => {
        const params = (TestModel.list as Mock).mock.calls[1][0];
        const expectedParams = new URLSearchParams('title_filter=filterValue');
        expect(params.toString()).toBe(expectedParams.toString());
      });
    });
  });
});
