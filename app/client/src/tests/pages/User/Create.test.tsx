import React from 'react';
import { render } from '@testing-library/react';

import { t } from '@plugins/i18n';

import { ModelCreatePage } from '@pages/ModelCreatePage';

import UserModel from '@models/User';
import { UserCreatePage } from '@models/User/pages/UserCreatePage';
import { UserUpsertForm } from '@models/User/pages/components/UserUpsertForm';

vi.mock('@pages/ModelCreatePage');

const expectedProps = {
  successMessage: t('New user has been created.'),
  errorMessage: t('Unable to create new user. Please contact website administrator.'),
  entityForm: UserUpsertForm,
  model: UserModel,
};

describe(UserCreatePage, () => {
  it('should render the form with default values', async () => {
    render(<UserCreatePage model={expectedProps.model} />);
    expect(ModelCreatePage).toHaveBeenCalledWith(expectedProps, expect.anything());
  });
});
