import React, {createContext} from 'react';

import {SubmissionFilters} from '@/interfaces/Submission';

type SubmissionFiltersContextData = {
  filters: SubmissionFilters;
  setFilters: React.Dispatch<React.SetStateAction<SubmissionFilters>>;
};

export const SubmissionFiltersContext =
  createContext<SubmissionFiltersContextData>({
    filters: {
      parkingDuration: [],
      dateRange: null,
      dateRangeInterval: null,
      day: null,
      issue: null,
    },
    setFilters: () => {},
  });
