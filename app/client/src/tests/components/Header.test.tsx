import React from 'react';
import { queryHelpers, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Header from '@components/Header';
import { AuthContext, hasAccess } from '@context/AuthProvider';
import AuthContextStub from '@tests/jestUtils/authContext';
import { t } from '@plugins/i18n';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import type { AuthCookie } from '@typedef/auth';
import { getAuthCookie } from '@tests/jestUtils/authUser';

// Mocking the body-scroll-lock functions
vi.mock('body-scroll-lock', () => ({
  disableBodyScroll: vi.fn(),
  enableBodyScroll: vi.fn(),
  clearAllBodyScrollLocks: vi.fn(),
}));

const authCookie = getAuthCookie();
const renderHeader = (auth?: AuthCookie) => render(
  <AuthContext.Provider value={{ ...AuthContextStub, auth, hasAccess: hasAccess.bind(undefined, auth?.user) }}>
    <BrowserRouter>
      <Header />
    </BrowserRouter>
  </AuthContext.Provider>
);

describe(Header, () => {
  beforeAll(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
  });

  it('should contain logo with links', () => {
    const { container } = renderHeader();

    expect(container.querySelector('.site-header__logo')).toHaveAttribute('href', '/');
  });

  it('should toggle menu visibility when menu button is clicked', async () => {
    const { container } = renderHeader(authCookie);

    const mobileMenuBtn = queryHelpers.queryByAttribute(
      'class',
      container,
      'btn menu__btn',
    ) as HTMLButtonElement;

    const menu = queryHelpers.queryByAttribute(
      'class',
      container,
      'main-menu d-flex flex-grow-1',
    ) as HTMLDivElement;

    await userEvent.click(mobileMenuBtn);

    // Button and menu should receive 'active' class.
    await waitFor(() => {
      expect(mobileMenuBtn).toHaveClass('active');
    });
    expect(disableBodyScroll).toHaveBeenCalled();
    expect(menu).toHaveClass('active');

    // Overlay is displayed.
    expect(screen.getByRole('presentation')).toBeInTheDocument();

    await userEvent.click(mobileMenuBtn);

    // The button and menu do not have the 'active' class.
    await waitFor(() => {
      expect(mobileMenuBtn).not.toHaveClass('active');
    });
    expect(enableBodyScroll).toHaveBeenCalled();
    expect(menu).not.toHaveClass('active');

    // Overlay is hidden.
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
  });

  it('should clearAllBodyScrollLocks on window resize', async () => {
    renderHeader(authCookie);

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1025,
    });

    global.dispatchEvent(new Event('resize'));

    await waitFor(() => {
      expect(clearAllBodyScrollLocks).toHaveBeenCalled();
    });
  });

  describe('Logout button', () => {
    it('should be rendered', () => {
      renderHeader(authCookie);
      expect(screen.queryAllByRole('button', { name: t('Sign out') })).toHaveLength(2);
    });

    it('should not be rendered', () => {
      renderHeader();
      expect(screen.queryAllByRole('button', { name: t('Sign out') })).toHaveLength(0);
    });

    it('should trigger logout', async () => {
      renderHeader(authCookie);

      await userEvent.click(screen.getAllByRole('button', { name: t('Sign out') })[0]);
      expect(AuthContextStub.logout).toHaveBeenCalled();
    });
  });
});
