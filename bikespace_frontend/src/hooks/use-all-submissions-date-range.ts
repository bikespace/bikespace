import {SubmissionsDateRange} from '@/interfaces/Submission';

import {useSubmissionsQuery} from './use-submissions-query';

export const useAllSubmissionsDateRange = (): SubmissionsDateRange => {
  const queryData = useSubmissionsQuery();

  const allSubmissions = queryData.data || [];

  return allSubmissions.length === 0
    ? {
        first: null,
        last: null,
      }
    : {
        first: new Date(allSubmissions[0].parking_time),
        last: new Date(allSubmissions[allSubmissions.length - 1].parking_time),
      };
};
