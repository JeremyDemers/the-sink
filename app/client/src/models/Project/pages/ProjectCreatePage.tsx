import React from 'react';

import type { ModelComponentProps } from '@typedef/models';

import { t } from '@plugins/i18n';

import { ModelCreatePage } from '@pages/ModelCreatePage';

import type { ProjectModel } from '../ProjectModel';
import { ProjectUpsertForm } from './components/ProjectUpsertForm';

export const ProjectCreatePage: React.FC<ModelComponentProps<ProjectModel>> = ({ model }) => {
  return (
    <ModelCreatePage<typeof model>
      entityForm={ProjectUpsertForm}
      model={model}
      successMessage={t('Project has been created.')}
      errorMessage={t('Unable to save new project. Please contact website administrator.')}
    />
  );
};
