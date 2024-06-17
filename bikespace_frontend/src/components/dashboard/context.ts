import React, {createContext} from 'react';

import {SubmissionApiPayload, SubmissionFilters} from '@/interfaces/Submission';

export enum SidebarTab {
  Data = 'data',
  Filters = 'filters',
  Feed = 'feed',
}

type TabContextData = {
  tab: SidebarTab;
  setTab: React.Dispatch<React.SetStateAction<SidebarTab>>;
};

export const TabContext = createContext<TabContextData>({
  tab: SidebarTab.Data,
  setTab: () => {},
});

type SubmissionFiltersContextData = {
  filters: SubmissionFilters;
  setFilters: React.Dispatch<React.SetStateAction<SubmissionFilters>>;
};

export const SubmissionFiltersContext =
  createContext<SubmissionFiltersContextData>({
    filters: {
      parkingDuration: [],
      dateRange: null,
      day: null,
      issue: null,
    },
    setFilters: () => {},
  });

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

type FocusedSubmissionIdContextData = {
  focus: number | null;
  setFocus: React.Dispatch<React.SetStateAction<number | null>>;
};

export const FocusedSubmissionIdContext =
  createContext<FocusedSubmissionIdContextData>({
    focus: null,
    setFocus: () => {},
  });
