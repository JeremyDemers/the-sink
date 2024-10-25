import React, { useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { AuthCookie, AuthUser } from '@typedef/auth';

import { AuthProvider, AuthContext } from '@context/AuthProvider';
import { t } from '@plugins/i18n';

import { UserRole } from '@models/User';

import { authCookie } from './authCookie';

vi.mock('axios');
vi.mock('react-toastify');
vi.mock('js-cookie', async () => ({
  default: {
    get: vi.fn().mockReturnValue(JSON.stringify((await import('./authCookie')).authCookie)),
    set: vi.fn(),
  },
}));

function ComponentWithContext() {
  const context = useContext(AuthContext);
  return <>
    <button name="login" onClick={context.login}>Login</button>
    <button name="logout" onClick={context.logout}>Logout</button>
    <button name="refreshSession" onClick={context.refreshSession}>Refresh Session</button>
    <span>{`User ID: ${context.auth?.user.id}`}</span>
    <span>{`User Role: ${context.auth?.user.role}`}</span>
    <span>{`Has permission to view projects: ${context.hasAccess('view projects')}`}</span>
    <span>{`Has permission to undefined permission: ${context.hasAccess('undefined permission')}`}</span>
  </>;
}

const renderComponent = () => render(
  <AuthProvider>
    <ComponentWithContext />
  </AuthProvider>,
);
const originalLocation = window.location.href;

describe(AuthProvider, () => {
  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      value: { href: 'https://test.com' },
      writable: true,
    });
  });

  beforeEach(() => {
    (axios.get as Mock).mockResolvedValue({ data: authCookie.user });
  });

  afterEach(() => {
    // eslint-disable-next-line xss/no-location-href-assign
    window.location.href = originalLocation;
  });

  it('should provide user context with initial value from cookies', () => {
    renderComponent();
    expect(screen.getByText(`User ID: ${UserRole.Scientist}`)).toBeInTheDocument();
    expect(screen.getByText(`User Role: ${UserRole.Scientist}`)).toBeInTheDocument();
  });

  it('should update user context after fetching user data', async () => {
    (axios.get as Mock).mockResolvedValue({ data: { ...authCookie.user, role: UserRole.Authenticated } });
    renderComponent();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(__AUTH_API__.currentUser);
    });

    expect(screen.getByText(`User Role: ${UserRole.Authenticated}`)).toBeInTheDocument();
  });

  it('should show toast error message if fetching user data was not successful', async () => {
    (axios.get as Mock).mockRejectedValue({
      response: {
        message: 'Server error',
        status: 500,
      }
    });
    renderComponent();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        t('Unable to refresh user data. Try to logout and login again, if the problem persists.'),
      );
    });
  });

  it('should show toast error message if user is blocked', async () => {
    (axios.get as Mock).mockRejectedValue({
      response: {
        message: 'Server error',
        status: 401,
      }
    });
    renderComponent();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        t('Your user has been blocked! Please contact website administrator.'),
      );
    });
  });

  it('should set updated user data in cookies', async () => {
    // eslint-disable-next-line sonarjs/no-nested-template-literals
    const cookieId = `${__APP_NAME__ ? `${__APP_NAME__}-` : ''}auth` as const;
    const userUpdated: AuthUser = {
      ...authCookie.user,
      role: UserRole.Administrator,
    };

    const authCookieUpdated: AuthCookie = {
      ...authCookie,
      user: userUpdated,
    };

    (axios.get as Mock).mockResolvedValue({ data: userUpdated });
    renderComponent();

    await waitFor(() => {
      expect(Cookies.set).toHaveBeenCalledWith(cookieId, JSON.stringify(authCookieUpdated));
    });
  });

  it('should provide login callback', async () => {
    renderComponent();
    await userEvent.click(screen.getByText('Login'));
    expect(window.location.href).toBe(__BACKEND_PREFIX__+ __AUTH_API__.login);
  });

  it('should provide logout callback', async () => {
    renderComponent();
    await userEvent.click(screen.getByText('Logout'));
    expect(window.location.href).toBe(__BACKEND_PREFIX__ + __AUTH_API__.logout);
  });

  it('should provide refresh session callback', async () => {
    (axios.post as Mock).mockResolvedValue({ data: 'some data' });
    renderComponent();

    await userEvent.click(screen.getByText('Refresh Session'));
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(__AUTH_API__.refresh);
    });
  });

  it('should show error toast message when refresh session was not successful', async () => {
    const error = new Error('Unable to refresh the session');
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementationOnce(vi.fn());

    (axios.post as Mock).mockRejectedValue(error);
    renderComponent();

    await userEvent.click(screen.getByText('Refresh Session'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('[dev] refreshSession', error);
      expect(toast.error).toHaveBeenCalledWith(t('Unable to refresh the session. Try to login again.'));
    });
  });

  it('should provide handle permission check', async () => {
    renderComponent();
    expect(screen.getByText('Has permission to view projects: true')).toBeInTheDocument();
    expect(screen.getByText('Has permission to undefined permission: false')).toBeInTheDocument();
  });
});
