import React from 'react';
import { RequireAccess } from '@components/RequireAccess';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthContext, hasAccess } from '@context/AuthProvider';
import AuthContextStub from '@tests/jestUtils/authContext';
import { AuthContextValues, AuthCookie } from '@typedef/auth';
import { getAuthCookie, getAuthUser } from '@tests/jestUtils/authUser';

vi.mock('@pages/Error', () => ({
  PageError: () => (<div>Error page</div>),
}));

const renderRouting = (auth?: AuthCookie) => {
  const defaultAuth: AuthContextValues = {
    ...AuthContextStub,
    auth,
    hasAccess: (thing) => hasAccess(auth?.user, thing),
  };

  return render(
    <AuthContext.Provider value={defaultAuth}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<div>User login</div>} />
          <Route element={<RequireAccess thing="view projects"/>}>
            <Route path="/" element={<div>Projects listing page</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe(RequireAccess, () => {
  it('should display a page for logged-in with permission', () => {
    renderRouting(getAuthCookie());
    expect(screen.getByText('Projects listing page')).toBeInTheDocument();
  });

  it('should display error page for logged-in without permission', () => {
    renderRouting(getAuthCookie(getAuthUser({ permissions: [] })));
    expect(screen.getByText('Error page')).toBeInTheDocument();
  });

  it('should redirect anonymous users to login', () => {
    renderRouting();
    expect(screen.getByText('User login')).toBeInTheDocument();
  });
});
