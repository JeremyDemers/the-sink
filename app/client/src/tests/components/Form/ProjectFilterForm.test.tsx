import React from 'react';
import { fireEvent, queryHelpers, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { ProjectsListFiltersForm } from '@models/Project/pages/ProjectsListPage';
import { t } from '@plugins/i18n';
import { ProjectStatus, ProjectStatusMetadata } from '@models/Project';

const formikConfig = {
  onSubmit: vi.fn(),
  resetForm: vi.fn(),
};

const renderFilterForm = (filters: Record<string, string> = {}, urlQuery = '') => (
  render(
    <MemoryRouter initialEntries={urlQuery ? [urlQuery] : undefined}>
      <ProjectsListFiltersForm config={formikConfig} filters={filters} isLoading={false} />
    </MemoryRouter>
  )
);

describe(ProjectsListFiltersForm, () => {
  it('should render form with all inputs and buttons', async () => {
    const { container } = renderFilterForm();

    const contentWrapper = queryHelpers.queryByAttribute(
      'class',
      container,
      'collapsible__content form-filters__wrapper'
    ) as HTMLDivElement;

    await userEvent.click(screen.getByRole('button', { name: t('More filters') }));

    await waitFor(() => {
      expect(contentWrapper).toHaveClass('collapsible-expanded');
    });

    fireEvent.transitionEnd(contentWrapper);

    expect(screen.getByRole('textbox', { name: t('Title') })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: t('Author') })).toBeInTheDocument();

    // status filter and all it's options.
    const status = screen.getByRole('combobox', { name: t('Status') });
    await userEvent.click(status);
    expect(screen.getByText(t('Draft'))).toBeInTheDocument();
    expect(screen.getByText(t('Completed'))).toBeInTheDocument();
    expect(screen.queryByText(t('Archived'))).not.toBeInTheDocument();

    // Date inputs.
    expect(screen.getByLabelText(t('Created from'))).toBeInTheDocument();
    expect(screen.getByLabelText(t('Created to'))).toBeInTheDocument();

    // Reset and filter buttons.
    expect(screen.getByRole('button', { name: t('Reset') })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('Apply') })).toBeInTheDocument();
  });

  it('should prefill and clear prefilled input values', async () => {
    const filters = {
      title_filter: 'value1',
      author_name_filter: 'value2',
      status_filter: ProjectStatus.Draft,
      created_from_filter: '2024-02-01',
      created_to_filter: '2024-05-01',
    };
    const { container } = renderFilterForm(filters);

    for (const [name, value] of Object.entries(filters)) {
      if (name !== 'status_filter') {
        const input = queryHelpers.queryByAttribute('name', container, name) as HTMLInputElement;
        expect(input).toHaveAttribute('value', value);

        const resetButton = input.closest('.field')?.querySelector('button.reset-field-value');
        expect(resetButton?.tagName).toBe('BUTTON');
        await userEvent.click(resetButton as HTMLButtonElement);
        await waitFor(() => {
          expect(input).toHaveAttribute('value', '');
        });
      } else {
        const input = queryHelpers.queryByAttribute('id', container, name) as HTMLInputElement;
        const valueElement = input.closest('.select__value-container') as HTMLDivElement;
        expect(valueElement).toHaveTextContent(ProjectStatusMetadata[ProjectStatus.Draft].label);

        const resetButton = (valueElement.nextElementSibling as HTMLDivElement).querySelector('.select__clear-indicator');
        await userEvent.click(resetButton as HTMLDivElement);
        expect(valueElement).toHaveTextContent(t('Search by project status'));
      }
    }
  });

  it('should call model table update on filter reset', async () => {
    const filters = {
      title_filter: 'value1',
    };
    renderFilterForm(filters);

    const reset = screen.getByRole('button', { name: t('Reset') });
    await userEvent.click(reset);

    expect(formikConfig.resetForm).toHaveBeenCalledWith({
      'title_filter': 'value1',
    });
  });

  it('should validate user input before form submit', async () => {
    renderFilterForm();

    await userEvent.type(screen.getByLabelText(t('Created from')), '2024-02-01');
    await userEvent.type(screen.getByLabelText(t('Created to')), '2023-02-01');
    await userEvent.click(screen.getByRole('button', { name: t('Apply') }));

    await waitFor(() => {
      expect(screen.getByText(t('"Created from" must be earlier than "Created to"'))).toBeInTheDocument();
    });
  });

  it('should call model table form submit', async () => {
    renderFilterForm();

    const title = screen.getByRole('textbox', { name: t('Title') });
    const submit = screen.getByRole('button', { name: t('Apply') });

    await userEvent.type(title, 'filterValue');
    await userEvent.click(submit);

    await waitFor(() => {
      expect(formikConfig.onSubmit).toHaveBeenCalledWith({
        title_filter: 'filterValue',
        author_name_filter: '',
        created_from_filter: '',
        created_to_filter: '',
        status_filter: '',
      }, expect.anything());
    });
  });

  it('should not display status filter on the archive page', () => {
    renderFilterForm({}, '/projects?status_filter=archived');

    expect(screen.queryByRole('combobox', { name: t('Status') })).not.toBeInTheDocument();
  });
});
