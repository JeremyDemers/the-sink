import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { UserRole } from '@models/User';
import { UsersListFiltersForm } from '@models/User/pages/UsersListPage';
import { t } from '@plugins/i18n';

const formikConfig = {
  onSubmit: vi.fn(),
  resetForm: vi.fn(),
};

const renderFilterForm = (filters: Record<string, string> = {}, urlQuery = '') => (
  render(
    <MemoryRouter initialEntries={urlQuery ? [urlQuery] : undefined}>
      <UsersListFiltersForm config={formikConfig} filters={filters} isLoading={false} />
    </MemoryRouter>
  )
);

describe(UsersListFiltersForm, () => {
  it('should render form with all inputs and buttons', async () => {
    renderFilterForm();

    expect(screen.getByRole('textbox', { name: t('Name') })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: t('Email') })).toBeInTheDocument();

    // State filter and all it's options.
    const state = screen.getByRole('combobox', { name: t('Role') });
    await userEvent.click(state);

    expect(screen.getByText(t('Administrator'))).toBeInTheDocument();
    expect(screen.getByText(t('Scientist'))).toBeInTheDocument();
    expect(screen.getByText(t('Authenticated'))).toBeInTheDocument();

    // Reset and filter buttons.
    expect(screen.getByRole('button', { name: t('Reset') })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('Apply') })).toBeInTheDocument();
  });

  it('should prefill input values', async () => {
    renderFilterForm({
      name_filter: 'value1',
      email_filter: 'value2',
      role_filter: UserRole.Authenticated.toString(),
    });

    expect(screen.getByDisplayValue('value1')).toHaveAttribute('name', 'name_filter');
    expect(screen.getByDisplayValue('value2')).toHaveAttribute('id', 'email_filter');
    expect(screen.getByText(t('Authenticated'))).toBeInTheDocument();
  });

  it('should call ModelTable reset filters', async () => {
    renderFilterForm({
      name_filter: 'value1',
    });

    const reset = screen.getByRole('button', { name: t('Reset') });
    await userEvent.click(reset);

    expect(formikConfig.resetForm).toHaveBeenCalledWith({ name_filter: 'value1' });
  });

  it('should call model table form submit', async () => {
    renderFilterForm();

    const name = screen.getByRole('textbox', { name: t('Name') });
    const submit = screen.getByRole('button', { name: t('Apply') });

    await userEvent.type(name, 'filterValue');
    await userEvent.click(submit);
    await waitFor(() => {
      expect(formikConfig.onSubmit).toHaveBeenCalledWith({
        email_filter: '',
        name_filter: 'filterValue',
        role_filter: '',
      }, expect.anything());
    });
  });
});
