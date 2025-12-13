import {useQuery} from '@tanstack/react-query';

import {SubmissionApiPayload} from '@/interfaces/Submission';

export function useSubmissionsQuery() {
  const query = useQuery({
    queryKey: ['submissions'],
    queryFn: async () => {
      const countRes = await fetch(
        `${process.env.BIKESPACE_API_URL_DASHBOARD}/submissions?limit=1`
      );
      const countData = await countRes.json();
      const total_items = countData.pagination.total_items;

      const res = await fetch(
        `${process.env.BIKESPACE_API_URL_DASHBOARD}/submissions?limit=${total_items}`
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
    staleTime: Infinity, // Only fetch data once per app load
  });

  return query;
}
