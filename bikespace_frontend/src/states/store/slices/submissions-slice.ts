import {StateCreator} from 'zustand';

import type {SubmissionFeature} from '@/interfaces/Submission';

import {FiltersSlice} from './filters-slice';

export interface SubmissionsSlice {
  submissions: SubmissionFeature[];
  setSubmissions: (submissions: SubmissionFeature[]) => void;
}

export const createSubmissionsSlice: StateCreator<
  SubmissionsSlice & FiltersSlice,
  [],
  [],
  SubmissionsSlice
> = set => ({
  submissions: [],
  setSubmissions: submissions => {
    set(() => ({submissions}));
  },
});
