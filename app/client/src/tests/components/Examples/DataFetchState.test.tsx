import React from 'react';
import { type Mock } from 'vitest';
import DataFetchState from '@components/Examples/DataFetchState';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import axios from 'axios';

vi.mock('axios');

describe('ExampleDataFetchState', () => {
  it('should render component', () => {
    render(<DataFetchState />);

    expect(screen.getByRole('heading', { level: 5 })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByTestId('example-list')).toBeInTheDocument();
  });

  describe('Data fetch', () => {
    const results = {
      data: {
        itemKey1: 'value 1',
        itemKey2: 'value 2',
      },
    };

    it('should render results', async () => {
      (axios.get as Mock).mockImplementation(() => Promise.resolve(results));

      render(<DataFetchState />);

      const buttonClick = userEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        // Loader is visible
        expect(screen.getByText(/Loading/)).toBeInTheDocument();
      });

      await buttonClick;

      const resultItems = screen.queryAllByTestId('example-item');

      resultItems.forEach((item, index) => {
        expect(item.textContent).toMatch(`itemKey${index + 1}: value ${index + 1}`);
      });

      // Loader is hidden
      expect(screen.queryByText(/Loading/)).toBeNull();
      // Button is hidden
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('should render an error message', async () => {
      (axios.get as Mock).mockImplementation(() => Promise.reject(new Error('Throw an error')));

      render(<DataFetchState />);

      const fetchBtn = screen.getByRole('button');

      await userEvent.click(fetchBtn);

      await waitFor(() => {
        // Fetch error is visible
        expect(screen.getByText('Throw an error')).toBeInTheDocument();
      });

      // Button is visible
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
