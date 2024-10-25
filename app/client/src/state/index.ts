import { combineReducers, configureStore } from '@reduxjs/toolkit';
import exampleSlice from './exampleSlice';

export const store = configureStore({
  reducer: combineReducers({
    example: exampleSlice.reducer
  }),
});

export type RootState = ReturnType<typeof store.getState>;
// Can still subscribe to the store
// store.subscribe(() => console.log(store.getState()))

// Still pass action objects to `dispatch`, but they're created for us
// store.dispatch(incremented())
