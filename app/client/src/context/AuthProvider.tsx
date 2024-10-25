import axios from 'axios';
import React, { createContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

import type { Access } from '@typedef/access';
import type { AuthContextValues, AuthCookie, AuthUser } from '@typedef/auth';

import { visit } from '@plugins/axios';
import { t } from '@plugins/i18n';

// IMPORTANT! Importing `@models/User/constants` instead of the `@models/User`
// to avoid circular dependencies as this file is imported by the files in
// the `@models/User` module.
import { UserRole } from '@models/User/constants';

type AccessCheck = (user: AuthUser | undefined, constraints: Access.Constraints) => boolean;

interface AuthProviderProps {
  readonly children: ReactNode;
}

const login = visit.bind(undefined, __AUTH_API__.login);

const logout = visit.bind(undefined, __AUTH_API__.logout);

const authCookie = (() => {
  // eslint-disable-next-line sonarjs/no-nested-template-literals
  const cookieId = `${__APP_NAME__ ? `${__APP_NAME__}-` : ''}auth` as const;

  return {
    getData(): AuthCookie | undefined {
      const value = Cookies.get(cookieId);

      return value ? JSON.parse(value) : undefined;
    },
    setData(value: AuthCookie): AuthCookie {
      // Update the cookie to prevent future component re-renders.
      Cookies.set(cookieId, JSON.stringify(value));

      return value;
    },
  };
})();

const accessChecks: readonly AccessCheck[] = [
  (user, constraints) => (
    !constraints.permission
    || !!user?.permissions.includes(constraints.permission)
  ),
  (user, constraints) => (
    !constraints.role
    || constraints.role === user?.role
    // There can be no unauthenticated user hence see whether
    // the constraint requires the `UserRole.Authenticated` role.
    || (!!user && constraints.role === UserRole.Authenticated)
  ),
] as const;

// @ts-expect-error TS2345
// noinspection TypeScriptValidateTypes
export const AuthContext = createContext<AuthContextValues>();

export function hasAccess(user: AuthUser | undefined, thing: Access.Argument): boolean {
  let constraints: Access.Constraints | undefined;

  if (typeof thing === 'object') {
    // The special handling of the `constraints: false`: the
    // access is allowed only to unauthenticated users.
    if (thing.constraints === false) {
      return !user;
    }

    constraints = thing.constraints;
  } else {
    constraints = {
      [typeof thing === 'number' ? 'role' : 'permission']: thing,
    };
  }

  // The access is allowed as there are no constraints.
  if (!constraints || (!constraints.permission && !constraints.role)) {
    return true;
  }

  return accessChecks[constraints.oneOf ? 'some' : 'every']((check) => check(user, constraints));
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [auth, setAuth] = useState(authCookie.getData);

  // Update user information in case it was changed on the user/edit form.
  useEffect(() => {
    if (auth) {
      axios
        .get<AuthUser>(__AUTH_API__.currentUser)
        .then(({ data: updatedUser }) => {
          if (auth.user.role !== updatedUser.role) {
            setAuth(
              // Update the cookie to prevent future component re-renders.
              authCookie.setData({
                ...auth,
                user: updatedUser,
              }),
            );
          }

          return auth;
        })
        .catch((error) => {
          if (error.response.status === 401) {
            toast.error(t('Your user has been blocked! Please contact website administrator.'));
          } else {
            toast.error(t('Unable to refresh user data. Try to logout and login again, if the problem persists.'));
          }
        });
    }
  });

  const contextValues: AuthContextValues = useMemo(
    () => ({
      auth,
      login,
      logout,
      hasAccess: (thing) => hasAccess(auth?.user, thing),
      refreshSession: () => axios
        .post(__AUTH_API__.refresh)
        .then(() => {
          const updated = authCookie.getData();
          setAuth(updated);
          return updated;
        })
        .catch((error) => {
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.error('[dev] refreshSession', error);
          }

          toast.error(t('Unable to refresh the session. Try to login again.'));
          setAuth(undefined);
          return undefined;
        }),
    }),
    [auth],
  );

  return <AuthContext.Provider value={contextValues}>{children}</AuthContext.Provider>;
};
