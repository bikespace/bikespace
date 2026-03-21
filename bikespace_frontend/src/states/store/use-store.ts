import {createWithEqualityFn} from 'zustand/traditional';
import {shallow} from 'zustand/shallow';

import {
  createFiltersSlice,
  createSubmissionsSlice,
  createUiSlice,
} from './slices';

import type {FiltersSlice, SubmissionsSlice, UiSlice} from './slices';

type StoreSlice = FiltersSlice & SubmissionsSlice & UiSlice;

// Combine modular stores (slices) into single global store
export const useStore = createWithEqualityFn<StoreSlice>()(
  (...a) => ({
    ...createFiltersSlice(...a),
    ...createSubmissionsSlice(...a),
    ...createUiSlice(...a),
  }),
  shallow
);
