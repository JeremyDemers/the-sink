import React from 'react';
import { type Mock } from 'vitest';
import { render } from '@testing-library/react';
import { AuthContext } from '@context/AuthProvider';
import UserModel from '@models/User';
import { ModelEditPage } from '@pages/ModelEditPage';
import AuthContextStub from '@tests/jestUtils/authContext';
import Model from '@tests/jestUtils/testModel/Model';
import * as ReactRouter from 'react-router-dom';
import { UserUpsertForm } from '@models/User/pages/components/UserUpsertForm';
import { UserEditPage } from '@models/User/pages/UserEditPage';
import { t } from '@plugins/i18n';
import { getAuthCookie } from '@tests/jestUtils/authUser';

vi.mock('@pages/ModelEditPage');

const expectedProps = {
  successMessage: t('User information has been updated.'),
  errorMessage: t('Unable to update user information. Please contact website administrator.'),
  entityForm: UserUpsertForm,
  model: UserModel,
};

const authCookie = getAuthCookie();

vi.mock('@pages/Error', () => ({
  PageError: () => (<div>Error page</div>),
}));

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof ReactRouter>()),
  useParams: vi.fn(),
}));

const renderEditPage = () => render(
  <AuthContext.Provider value={{ ...AuthContextStub, auth: authCookie, hasAccess: () => true }}>
    <ReactRouter.MemoryRouter initialEntries={[Model.routes.edit.toUrl(authCookie.user.id)]}>
      <UserEditPage model={expectedProps.model} />
    </ReactRouter.MemoryRouter>
  </AuthContext.Provider>
);

describe(UserEditPage, () => {
  it('should render the form with the user values', async () => {
    (ReactRouter.useParams as Mock).mockReturnValue({ entityId: '2' });
    renderEditPage();

    expect(ModelEditPage).toHaveBeenCalledWith(expectedProps, expect.anything());
  });
});
