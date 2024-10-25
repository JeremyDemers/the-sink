import React from 'react';
import { render } from '@testing-library/react';

import { t } from '@plugins/i18n';

import { ModelCreatePage } from '@pages/ModelCreatePage';

import ProjectModel from '@models/Project';
import { ProjectCreatePage } from '@models/Project/pages/ProjectCreatePage';
import { ProjectUpsertForm } from '@models/Project/pages/components/ProjectUpsertForm';

vi.mock('@pages/ModelCreatePage');

const expectedProps = {
  successMessage: t('Project has been created.'),
  errorMessage: t('Unable to save new project. Please contact website administrator.'),
  entityForm: ProjectUpsertForm,
  model: ProjectModel,
};

describe(ProjectCreatePage, () => {
  it('should render the form with default values', async () => {
    render(<ProjectCreatePage model={expectedProps.model} />);
    expect(ModelCreatePage).toHaveBeenCalledWith(expectedProps, expect.anything());
  });
});
