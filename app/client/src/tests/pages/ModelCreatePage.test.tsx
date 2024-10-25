import React from 'react';
import { type Mock } from 'vitest';
import { ModelCreatePage } from '@pages/ModelCreatePage';
import * as ReactRouter from 'react-router-dom';
import { screen, render, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import submitWithValues from '@tests/jestUtils/testModel/submitWithValues';

import { AuthContext } from '@context/AuthProvider';
import { t } from '@plugins/i18n';
import AuthContextStub from '@tests/jestUtils/authContext';

import Model from '@tests/jestUtils/testModel/Model';
import TestForm from '@tests/jestUtils/testModel/Form';

// Mocks
vi.mock('@tests/jestUtils/testModel/Model', async (importOriginal) => ({
  default: {
    ...(await importOriginal<{ default: typeof Model }>()).default,
    create: vi.fn(),
  },
}));

vi.mock('react-toastify');

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof ReactRouter>()),
  useNavigate: vi.fn(),
}));

const renderModelCreatePage = () => (
  render(
    <AuthContext.Provider value={{ ...AuthContextStub, hasAccess: () => true }}>
      <ReactRouter.MemoryRouter>
        <ModelCreatePage
          model={Model}
          entityForm={TestForm}
          successMessage={'form.success.createAction'}
          errorMessage={'form.errors.createAction'}
        />
      </ReactRouter.MemoryRouter>
    </AuthContext.Provider>
  )
);

describe(ModelCreatePage, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should navigate to edit URI on successful submission', async () => {
    const navigate = vi.fn();
    (ReactRouter.useNavigate as Mock).mockReturnValue(navigate);
    (Model.create as Mock).mockResolvedValue({ id: 1, title: 'Test Value' });

    renderModelCreatePage();

    await submitWithValues('Test value');

    await waitFor(() => {
      expect(Model.create as Mock).toHaveBeenCalledWith({
        title: 'Test value',
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('form.success.createAction');
    });

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/test-model/1', { replace: true });
    });
  });

  it('should show error toast on submission failure', async () => {
    const error = new Error('Creation failed');
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementationOnce(vi.fn());

    (Model.create as Mock).mockRejectedValue(error);

    renderModelCreatePage();

    await submitWithValues('Test value');

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('[dev]', error);
      expect(toast.error).toHaveBeenCalledWith('form.errors.createAction');
    });
  });

  it('should display the back link', () => {
    renderModelCreatePage();

    const backButton = screen.getByText(t('Back'));
    expect(backButton).toBeInTheDocument();
    expect(backButton).toHaveAttribute('href', Model.routes.list.path);
  });
});
