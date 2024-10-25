import type { HasLabel } from '@typedef/global';
import type { User } from '@models/User';

import { t } from '@plugins/i18n';

export const UserRole = {
  Administrator: 1,
  Scientist: 2,
  Authenticated: 3,
} as const;

export const UserRoleMetadata: Record<User.Role, HasLabel<string>> = {
  [UserRole.Administrator]: {
    label: t('Administrator'),
  },
  [UserRole.Scientist]: {
    label: t('Scientist'),
  },
  [UserRole.Authenticated]: {
    label: t('Authenticated'),
  },
} as const;
