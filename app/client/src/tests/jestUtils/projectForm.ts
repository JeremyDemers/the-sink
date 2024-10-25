import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';

import { t } from '@plugins/i18n';

const submitWithValues = async (title: string, description: string) => {
  const titleInput = screen.getByRole('textbox', { name: `${t('Project title')} *` });
  await userEvent.clear(titleInput);
  if (title) {
    await userEvent.type(titleInput, title);
  }

  const descriptionTextarea = screen.getByRole('textbox', { name: `${t('Description')} *` });
  await userEvent.clear(descriptionTextarea);
  if (description) {
    await userEvent.type(descriptionTextarea, description);
  }

  await userEvent.click(screen.getByRole('button', { name: t('Save project') }));
};

export default submitWithValues;
