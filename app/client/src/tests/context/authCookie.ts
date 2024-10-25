import type { AuthCookie } from '@typedef/auth';
import type { Primitive } from '@typedef/global';

export const authCookie: AuthCookie = {
  user: {
    id: 2,
    email: 'sink-email@gmail.com',
    role: 2,
    name: 'FN LN',
    is_active: true,
    created_at: '2024-07-31T18:54:55.877378' as Primitive.DateTime,
    updated_at: '2024-07-31T18:54:55.877378' as Primitive.DateTime,
    permissions: [
      'view users',
      'edit users',
      'create projects',
      'edit projects',
      'view projects',
    ],
  },
  expires: 1718017447,
  expires_in: 3600,
};
