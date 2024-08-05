import {useQuery} from '@tanstack/react-query';

import {SubmissionApiPayload} from '@/interfaces/Submission';

export function useSubmissionsQuery() {
  const query = useQuery({
    queryKey: ['submissions'],
    queryFn: async () => {
      const res = await fetch(
        'https://api-dev.bikespace.ca/api/v2/submissions?limit=5000'
      );

      const data = await res.json();

      return data;
    },
    select: data => {
      const submissions: SubmissionApiPayload[] = data.submissions || [];

      submissions.sort(
        (a, b) =>
          new Date(a.parking_time).getTime() -
          new Date(b.parking_time).getTime()
      );

      return submissions;
    },
    staleTime: Infinity,
  });

  return query;
}