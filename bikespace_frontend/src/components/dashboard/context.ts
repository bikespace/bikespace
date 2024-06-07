import React, {createContext} from 'react';

import {SubmissionApiPayload, SubmissionFilters} from '@/interfaces/Submission';

type TabContextData = {
  tab: string;
  setTab: React.Dispatch<React.SetStateAction<string>>;
} | null;

export const TabContext = createContext<TabContextData>(null);

type SubmissionFiltersContextData = {
  filters: SubmissionFilters;
  setFilters: React.Dispatch<React.SetStateAction<SubmissionFilters>>;
} | null;

export const SubmissionFiltersContext =
  createContext<SubmissionFiltersContextData>(null);

export const SubmissionsContext = createContext<SubmissionApiPayload[]>([]);

export type SubmissionsDateRangeContextData = {
  first: Date | null;
  last: Date | null;
};

export const SubmissionsDateRangeContext =
  createContext<SubmissionsDateRangeContextData>({
    first: null,
    last: null,
  });
