import {createWithEqualityFn} from 'zustand/traditional';
import {shallow} from 'zustand/shallow';

import {
  FiltersSlice,
  createFiltersSlice,
  SubmissionsSlice,
  createSubmissionsSlice,
} from './slices';

type StoreSlice = FiltersSlice & SubmissionsSlice;

// Combine modular stores (slices) into single global store
export const useSubmissionsStore = createWithEqualityFn<StoreSlice>()(
  (...a) => ({
    ...createFiltersSlice(...a),
    ...createSubmissionsSlice(...a),
  }),
  shallow
);
