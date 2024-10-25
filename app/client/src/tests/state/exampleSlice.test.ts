import exampleSlice from '@state/exampleSlice';
import { type Mock } from 'vitest';
import { initialExampleState, fetchExampleData } from '@state/exampleSlice';
import { configureStore } from '@reduxjs/toolkit';

import axios from 'axios';

vi.mock('axios');

const results = {
  data: {
    itemKey1: 'value 1',
    itemKey2: 'value 2',
  },
};

const store = configureStore({ reducer: exampleSlice.reducer });

describe('ExampleSlice', () => {

  it('should return initial state', () => {
    expect(exampleSlice.reducer(initialExampleState, { type: ''})).toEqual(initialExampleState);
  });

  it('should return data', async () => {
    (axios.get as Mock).mockImplementationOnce(() => Promise.resolve(results));

    await store.dispatch(fetchExampleData());

    const state = store.getState();

    expect(state.data).toEqual(results.data);
    expect(state.status).toBe('succeeded');
  });

  it('should handle error', async () => {
    (axios.get as Mock).mockImplementationOnce(() => Promise.reject(new Error('Failed to fetch')));

    await store.dispatch(fetchExampleData());

    const state = store.getState();

    expect(state.error).toBe('Failed to fetch');
    expect(state.status).toBe('failed');
  });
});
