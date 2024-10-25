import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '@components/Footer';

describe('Footer', () => {
  it('should contain logo', () => {
    render(<BrowserRouter><Footer /></BrowserRouter>);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt');
  });

  it('should contain link to the home page', () => {
    render(<BrowserRouter><Footer /></BrowserRouter>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/');
  });
});
