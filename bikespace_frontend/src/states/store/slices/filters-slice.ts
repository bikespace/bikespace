import {StateCreator} from 'zustand';

import {SubmissionFilters} from '@/interfaces/Submission';

export interface FiltersSlice {
  filters: SubmissionFilters;
  setFilters: (filters?: Partial<SubmissionFilters>) => void;
}

export const defaultFilter = {
  parkingDuration: [],
  dateRange: {from: null, to: null},
  dateRangeInterval: null,
  day: null,
  issue: null,
};

export const createFiltersSlice: StateCreator<
  FiltersSlice,
  [],
  [],
  FiltersSlice
> = set => ({
  filters: defaultFilter,
  setFilters: filters => {
    set(state => ({
      filters: filters ? {...state.filters, ...filters} : defaultFilter,
    }));
  },
});
