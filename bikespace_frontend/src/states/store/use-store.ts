import {createWithEqualityFn} from 'zustand/traditional';
import {shallow} from 'zustand/shallow';

import {
  FiltersSlice,
  createFiltersSlice,
  SubmissionsSlice,
  createSubmissionsSlice,
  createUiSlice,
  UiSlice,
} from './slices';

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
