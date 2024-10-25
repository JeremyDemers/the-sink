import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import type { AuthContextValues } from '@typedef/auth';

import { AuthContext } from '@context/AuthProvider';
import { PageError } from '@pages/Error';
import { PageLoginRoute } from '@pages/Login';

interface RequireAccessProps {
  readonly thing: Parameters<AuthContextValues['hasAccess']>[0];
}

export const RequireAccess: React.FC<RequireAccessProps> = ({ thing }) => {
  const authContext = useContext(AuthContext);

  // Check the access constraints first as the page may be public.
  if (!authContext.hasAccess(thing)) {
    // Access denied and no user - require to log in.
    if (!authContext.auth) {
      return <Navigate to={PageLoginRoute.path} />;
    }

    return <PageError />;
  }

  return <Outlet />;
};
