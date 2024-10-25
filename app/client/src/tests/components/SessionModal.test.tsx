import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SessionModal from '@components/SessionModal';
import { AuthContext } from '@context/AuthProvider';
import AuthContextStub from '@tests/jestUtils/authContext';
import { t } from '@plugins/i18n';
import { AuthCookie } from '@typedef/auth';
import { getAuthUser } from '@tests/jestUtils/authUser';

const expiresInSeconds = 60;
// Set expiration time to 1 minute.
const authCookie: AuthCookie = {
  user: getAuthUser(),
  expires: Math.round((new Date().getTime() + (expiresInSeconds * 1000)) / 1000),
  expires_in: expiresInSeconds,
};

const renderSessionModal = (auth?: AuthCookie) => render(
  <AuthContext.Provider value={{ ...AuthContextStub, auth }}>
    <SessionModal />
  </AuthContext.Provider>
);

describe(SessionModal, () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // @ts-expect-error TS2540
    // noinspection JSConstantReassignment
    AuthContextStub.refreshSession = vi.fn().mockResolvedValue(undefined);
  });

  it('should render Warning popup', async () => {
    // Run fake timer a bit earlier than an actual time (minute),
    // to make sure that popup will be always visible!
    // (seconds - 10% + 1sec)
    const timeShift = (expiresInSeconds - (expiresInSeconds * 0.1) + 1) * 1000;
    const updatedAuthCookie: AuthCookie = {
      ...authCookie,
      expires: authCookie.expires + timeShift,
    };

    // @ts-expect-error TS2540
    // noinspection JSConstantReassignment
    AuthContextStub.refreshSession = vi.fn().mockResolvedValue(updatedAuthCookie);

    // initial render - no popups are available
    renderSessionModal(authCookie);
    // No popup overlay available.
    expect(screen.queryByRole('presentation')).toBeNull();

    await act(() => {
      vi.advanceTimersByTime(timeShift);
    });

    // Has an overlay.
    expect(screen.getByRole('presentation')).toBeInTheDocument();
    // Has a title.
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    // Has Description.
    expect(screen.getByText(t('Do you want to stay connected?'))).toBeInTheDocument();

    // Logout.
    await userEvent.click(screen.getByText(t('Logout')));
    // The onLogout callback is called.
    expect(AuthContextStub.logout).toHaveBeenCalled();

    // Refresh.
    await userEvent.click(screen.getByText(t('I want to stay connected')));
    // Refresh callback is called.
    expect(AuthContextStub.refreshSession).toHaveBeenCalled();
    // Warning popup has been removed from DOM.
    expect(screen.queryByText(t('Your session is about to expire'))).toBeNull();
  });

  it('should render Logout popup', async () => {
    // initial render - no popups are available.
    renderSessionModal(authCookie);

    // 61_000 = (1min + 1sec)
    await act(() => {
      vi.advanceTimersByTime(62_000);
    });

    // Warning popup removed from DOM.
    expect(screen.queryByText(t('Your session is about to expire'))).toBeNull();

    // Has an overlay
    expect(screen.getByRole('presentation')).toBeInTheDocument();
    // Has a title
    expect(screen.getByText(t("You've been logged out"))).toBeInTheDocument();
    // Has Description
    expect(screen.getByText(t('To prevent unauthorized profile use, you have been logged out after 1 hour.'))).toBeInTheDocument();

    // onLogout callback is called.
    const buttonLogout = screen.getByText(t('Return to Login page'));
    await userEvent.click(buttonLogout);

    expect(AuthContextStub.logout).toHaveBeenCalled();

    // onLogin callback is called.
    const buttonLogin = screen.getByText(t('Sign in again'));
    await userEvent.click(buttonLogin);
    expect(AuthContextStub.login).toHaveBeenCalled();
  });

  it('should work with default values', async () => {
    // initial render - no popups are available
    renderSessionModal();

    // Be default display of deadline popup is 1 hour ahead of current time.
    // Run fake timer a bit later than one hour,
    // to make sure that popup will be always visible!
    await act(() => {
      vi.advanceTimersByTime(3_600_500);
    });

    // Re-render component after timeout.
    renderSessionModal();

    // Has an overlay
    expect(screen.getByRole('presentation')).toBeInTheDocument();
    // Has a title
    expect(screen.getByText(t("You've been logged out"))).toBeInTheDocument();
  });
});
