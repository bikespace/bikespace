import React, {createContext} from 'react';

export type SubmissionsDateRangeContextData = {
  first: Date | null;
  last: Date | null;
};

export const SubmissionsDateRangeContext =
  createContext<SubmissionsDateRangeContextData>({
    first: null,
    last: null,
  });
