import React from 'react';

import type { ModelComponentProps } from '@typedef/models';

import { t } from '@plugins/i18n';

import { ModelEditPage } from '@pages/ModelEditPage';

import type { ProjectModel } from '../ProjectModel';
import { ProjectUpsertForm } from './components/ProjectUpsertForm';

export const ProjectEditPage: React.FC<ModelComponentProps<ProjectModel>> = ({ model }) => {
  return (
    <ModelEditPage<typeof model>
      entityForm={ProjectUpsertForm}
      model={model}
      successMessage={t('Project has been updated.')}
      errorMessage={t('Unable to update the project. Please contact website administrator.')}
    />
  );
};
