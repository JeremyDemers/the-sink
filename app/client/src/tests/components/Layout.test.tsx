import React from 'react';
import { render, screen } from '@testing-library/react';

import type { AuthCookie } from '@typedef/auth';

import Layout from '@components/Layout';
import { AuthContext } from '@context/AuthProvider';
import AuthContextStub from '@tests/jestUtils/authContext';
import { getAuthCookie } from '@tests/jestUtils/authUser';

const renderLayout = (auth?: AuthCookie) => render(
  <AuthContext.Provider value={{ ...AuthContextStub, auth }}>
    <Layout>
      <div>Child component</div>
    </Layout>
  </AuthContext.Provider>
);

vi.mock('@components/Header', () => ({
  default: () => {
    return <div data-testid="header">Header</div>;
  },
}));

vi.mock('@components/Footer', () => ({
  default: () => {
    return <div data-testid="footer">Footer</div>;
  },
}));

vi.mock('@components/SessionModal', () => ({
  default: () => {
    return <div data-testid="session-modal">Session Modal</div>;
  },
}));

describe('Layout', () => {
  it('should render Header component', () => {
    renderLayout();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('should render Footer component', () => {
    renderLayout();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should render children', () => {
    renderLayout();
    expect(screen.getByText('Child component')).toBeInTheDocument();
  });

  describe('Session modal', () => {
    it('should be displayed for authenticated users', () => {
      renderLayout(getAuthCookie());
      expect(screen.getByTestId('session-modal')).toBeInTheDocument();
    });

    it('should not be displayed for anonymous users', () => {
      renderLayout();
      expect(screen.queryByTestId('session-modal')).toBeNull();
    });
  });
});
