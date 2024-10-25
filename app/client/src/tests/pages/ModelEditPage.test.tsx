import React from 'react';
import { toast } from 'react-toastify';
import { MemoryRouter } from 'react-router-dom';
import { type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { AuthContext } from '@context/AuthProvider';
import { t } from '@plugins/i18n';

import { ModelEditPage } from '@pages/ModelEditPage';

import AuthContextStub from '@tests/jestUtils/authContext';
import Form from '@tests/jestUtils/testModel/Form';
import Model from '@tests/jestUtils/testModel/Model';
import submitWithValues from '@tests/jestUtils/testModel/submitWithValues';

vi.mock('@tests/jestUtils/testModel/Model', async (importOriginal) => ({
  default: {
    ...(await importOriginal<{ default: typeof Model }>()).default,
    load: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('react-toastify');

vi.mock('@pages/Error', () => ({
  PageError: () => (<div>Error page</div>),
}));

const data = {
  id: 1,
  title: 'test title',
};

const renderModelEditPage = (canEdit = true) => (
  render(
    <AuthContext.Provider value={{...AuthContextStub, hasAccess: () => canEdit}}>
      <MemoryRouter initialEntries={[Model.routes.edit.toUrl(data.id)]}>
        <ModelEditPage<typeof Model>
          model={Model}
          entityForm={Form}
          successMessage="form.success.updateAction"
          errorMessage="form.errors.updateAction"
        />
      </MemoryRouter>
    </AuthContext.Provider>
  )
);

describe(ModelEditPage, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (Model.load as Mock).mockResolvedValue(data);
    (Model.update as Mock).mockResolvedValue(data);
  });

  it('should render the Error component in case user does not exists', async () => {
    (Model.load as Mock).mockRejectedValue(new Error("User doesn't exists"));

    renderModelEditPage();

    await waitFor(() => {
      expect(screen.getByText('Error page')).toBeInTheDocument();
    });
  });

  it('should show success toast message on update', async () => {
    renderModelEditPage();

    // We need to wait until form will be ready.
    await waitFor(() => {
      expect((Model.load as Mock)).toHaveBeenCalled();
    });

    await submitWithValues('New value');

    await waitFor(() => {
      expect(Model.update as Mock).toHaveBeenCalledWith({
        ...data,
        title: 'New value',
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('form.success.updateAction');
    });
  });

  it('should show error toast message on user update failure', async () => {
    (Model.update as Mock).mockRejectedValue(new Error('Unable to update'));

    renderModelEditPage();

    // We need to wait until form will be ready.
    await waitFor(() => {
      expect((Model.load as Mock)).toHaveBeenCalled();
    });

    await submitWithValues('New value');

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('form.errors.updateAction');
    });
  });

  it('should display the back link', async () => {
    renderModelEditPage();

    // We need to wait until form will be ready.
    await waitFor(() => {
      expect((Model.load as Mock)).toHaveBeenCalled();
    });

    const backButton = screen.getByText(t('Back'));
    expect(backButton).toBeInTheDocument();
    expect(backButton).toHaveAttribute('href', Model.routes.list.path);
  });
});
