import {SubmissionsDateRange} from '@/interfaces/Submission';

import {useSubmissionsQuery} from './use-submissions-query';

export const useAllSubmissionsDateRange = (): SubmissionsDateRange => {
  const queryData = useSubmissionsQuery();

  const allSubmissions = queryData.data ? queryData.data.features : [];

  return allSubmissions.length === 0
    ? {
        first: null,
        last: null,
      }
    : {
        first: new Date(allSubmissions[0].properties.parking_time + '+00:00'),
        last: new Date(
          allSubmissions[allSubmissions.length - 1].properties.parking_time +
            '+00:00'
        ),
      };
};
