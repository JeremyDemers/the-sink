import React from 'react';

import type { ModelComponentProps } from '@typedef/models';

import { t } from '@plugins/i18n';

import { ModelCreatePage } from '@pages/ModelCreatePage';

import type { UserModel } from '../UserModel';
import { UserUpsertForm } from './components/UserUpsertForm';

export const UserCreatePage: React.FC<ModelComponentProps<UserModel>> = ({ model }) => {
  return (
    <ModelCreatePage<typeof model>
      entityForm={UserUpsertForm}
      model={model}
      successMessage={t('New user has been created.')}
      errorMessage={t('Unable to create new user. Please contact website administrator.')}
    />
  );
};
