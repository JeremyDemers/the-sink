import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface ExampleState {
  data: null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string | null;
  loading: boolean;
}

export const initialExampleState: ExampleState = {
  data: null,
  status: 'idle',
  error: null,
  loading: false,
};

export const fetchExampleData = createAsyncThunk(
  'example/fetchData',
  async () => {
    const response = await axios.get('/example/data');
    return response.data;
  }
);

const exampleSlice = createSlice({
  name: 'example',
  initialState: initialExampleState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExampleData.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(fetchExampleData.fulfilled, (state, action: PayloadAction<null>) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchExampleData.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default exampleSlice;
