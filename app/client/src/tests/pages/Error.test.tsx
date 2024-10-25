import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { t } from '@plugins/i18n';

import { PageError } from '@pages/Error';

describe(PageError, () => {
  it('should contain 404 heading', () => {
    render(
      <BrowserRouter>
        <PageError />
      </BrowserRouter>,
    );

    expect(screen.getByRole('heading')).toHaveTextContent('404');
  });

  it('should contain description', () => {
    render(
      <BrowserRouter>
        <PageError />
      </BrowserRouter>,
    );

    expect(screen.getByText(t('The page you are looking for is gone.'))).toBeInTheDocument();
  });

  it('should contain link to the home page', () => {
    render(
      <BrowserRouter>
        <PageError />
      </BrowserRouter>,
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/');
  });
});
