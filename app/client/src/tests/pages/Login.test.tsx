import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PageLogin } from '@pages/Login';
import { AuthContext } from '@context/AuthProvider';
import AuthContextStub from '@tests/jestUtils/authContext';

describe(PageLogin, () => {
  it('should contain title', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={AuthContextStub}>
          <PageLogin />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should call callback onLogin', async () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={AuthContextStub}>
          <PageLogin />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    await userEvent.click(screen.getByRole('button'));
    expect(AuthContextStub.login).toHaveBeenCalled();
  });
});
