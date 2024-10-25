import React from 'react';
import { type Mock } from 'vitest';
import {screen, render, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { Provider } from 'react-redux';
import DataFetchRedux from '@components/Examples/DataFetchRedux';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import exampleSlice from '@state/exampleSlice';
import { t } from '@plugins/i18n';

vi.mock('axios');

const testStore = configureStore({
  reducer: combineReducers({
    example: exampleSlice.reducer
  }),
});

describe('ExampleDataFetchRedux', () => {
  it('should be properly rendered', () => {
    render(
      <Provider store={testStore}>
        <DataFetchRedux />
      </Provider>
    );

    expect(screen.getByText(t('Data fetch with Redux'))).toBeInTheDocument();
    expect(screen.getByText(t('Run example'))).toBeInTheDocument();
  });

  it('should render component with initial store data', () => {
    render(
      <Provider store={testStore}>
        <DataFetchRedux />
      </Provider>
    );

    expect(testStore.getState().example.data).toBeNull();
  });

  it('should render results', async () => {
    const results = {
      data: {
        itemKey1: 'value 1',
        itemKey2: 'value 2',
      },
    };

    (axios.get as Mock).mockImplementationOnce(() => Promise.resolve(results));

    render(
      <Provider store={testStore}>
        <DataFetchRedux />
      </Provider>
    );

    const exampleBtn = screen.getByText(t('Run example'));
    const exampleBtnClick = userEvent.click(exampleBtn);

    await waitFor(() => {
      // Loader is visible
      expect(screen.getByText(/Loading/)).toBeInTheDocument();
    });

    await exampleBtnClick;

    // Data displayed
    screen.queryAllByTestId('example-item').forEach((item, index) => {
      expect(item.textContent).toMatch(`itemKey${index + 1}: value ${index + 1}`);
    });

    // Loader is hidden
    expect(screen.queryByText(/Loading/)).toBeNull();
    // Button is hidden
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('should display an error message', async () => {
    (axios.get as Mock).mockImplementationOnce(() => Promise.reject(new Error('Throw an error')));

    render(
      <Provider store={configureStore({
        reducer: combineReducers({
          example: exampleSlice.reducer,
        }),
      })}>
        <DataFetchRedux />
      </Provider>
    );

    const exampleBtn = screen.getByText(t('Run example'));

    await userEvent.click(exampleBtn);

    await waitFor(() => {
      // Fetch error is visible
      expect(screen.getByText('Throw an error')).toBeInTheDocument();
    });

    // Button is visible
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
