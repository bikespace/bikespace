import type {StateCreator} from 'zustand';

import type {SubmissionApiPayload} from '@/interfaces/Submission';

import {FiltersSlice} from './filters-slice';

export interface SubmissionsSlice {
  submissions: SubmissionApiPayload[];
  setSubmissions: (submissions: SubmissionApiPayload[]) => void;
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
