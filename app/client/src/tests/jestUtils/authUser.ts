import type { AuthCookie, AuthUser } from '@typedef/auth';
import type { Primitive } from '@typedef/global';
import { UserRole } from '@models/User';

export function getAuthUser(overrides?: Partial<AuthUser>): AuthUser {
  return {
    id: 1,
    name: 'Jon Doe',
    role: UserRole.Administrator,
    email: 'jon.doe@gmail.com',
    is_active: true,
    created_at: '2024-07-31T18:54:55.877378' as Primitive.DateTime,
    updated_at: '2024-07-31T18:54:55.877378' as Primitive.DateTime,
    permissions: ['view projects'],
    ...overrides,
  };
}

export function getAuthCookie(user?: AuthUser): AuthCookie {
  return {
    user: user || getAuthUser(),
    expires: 1718017447,
    expires_in: 3600,
  };
}
