import React from 'react';

import type { ModelComponentProps } from '@typedef/models';

import { t } from '@plugins/i18n';

import { ModelEditPage } from '@pages/ModelEditPage';

import type { UserModel } from '../UserModel';
import { UserUpsertForm } from './components/UserUpsertForm';

export const UserEditPage: React.FC<ModelComponentProps<UserModel>> = ({ model }) => {
  return (
    <ModelEditPage<typeof model>
      entityForm={UserUpsertForm}
      model={model}
      successMessage={t('User information has been updated.')}
      errorMessage={t('Unable to update user information. Please contact website administrator.')}
    />
  );
};
