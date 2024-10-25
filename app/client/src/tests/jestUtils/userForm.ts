import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';

import { t } from '@plugins/i18n';

import { UserRoleMetadata, type User } from '@models/User';

const submitWithValues = async (email: string, role: User.Role) => {
  const emailInput: HTMLInputElement = screen.getByRole('textbox', { name: `${t('Email')} *` });

  // The readonly input cannot be cleared.
  if (!emailInput.readOnly) {
    await userEvent.clear(emailInput);
  }

  if (email) {
    await userEvent.type(emailInput, email);
  }

  const roleInput = screen.getByRole('combobox', { name: `${t('Role')} *` });

  await userEvent.click(roleInput);
  await userEvent.click(screen.getByText(UserRoleMetadata[role].label));
  await userEvent.click(screen.getByRole('button', { name: t('Save user') }));
};

export default submitWithValues;
