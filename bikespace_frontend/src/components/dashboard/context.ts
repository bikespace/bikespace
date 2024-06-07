import React, {createContext} from 'react';

import {SubmissionFilters} from '@/interfaces/Submission';

type TabContextData = {
  tab: string;
  setTab: React.Dispatch<React.SetStateAction<string>>;
} | null;

export const TabContext = createContext<TabContextData>(null);

type SubmissionFiltersContextData = {
  filters: SubmissionFilters | null;
  setFilters: React.Dispatch<React.SetStateAction<SubmissionFilters | null>>;
} | null;

export const SubmissionFiltersContext =
  createContext<SubmissionFiltersContextData>(null);
