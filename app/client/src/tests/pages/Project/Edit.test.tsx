import React from 'react';
import { render } from '@testing-library/react';

import { t } from '@plugins/i18n';

import { ModelEditPage } from '@pages/ModelEditPage';

import ProjectModel from '@models/Project';
import { ProjectEditPage } from '@models/Project/pages/ProjectEditPage';
import { ProjectUpsertForm } from '@models/Project/pages/components/ProjectUpsertForm';

vi.mock('@pages/ModelEditPage');

const expectedProps = {
  successMessage: t('Project has been updated.'),
  errorMessage: t('Unable to update the project. Please contact website administrator.'),
  entityForm: ProjectUpsertForm,
  model: ProjectModel,
};

describe(ProjectEditPage, () => {
  it('should render the form with the project values', async () => {
    render(<ProjectEditPage model={expectedProps.model} />);
    expect(ModelEditPage).toHaveBeenCalledWith(expectedProps, expect.anything());
  });
});
