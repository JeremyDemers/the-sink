import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import { AuthProvider } from '@context/AuthProvider';

import { t } from '@plugins/i18n';
import App from '@/App';

test('renders app, show login page', () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>,
  );

  expect(screen.getByText(t('Sign in with TheSink credentials'))).toBeInTheDocument();
});
