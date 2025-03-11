import {useQuery} from '@tanstack/react-query';

import {SubmissionApiGeoJsonPayload} from '@/interfaces/Submission';

export function useSubmissionsQuery() {
  const query = useQuery({
    queryKey: ['submissions'],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.BIKESPACE_API_URL_DASHBOARD}/submissions?limit=5000`,
        {
          headers: {
            Accept: 'application/geo+json',
            'Content-Type': 'application/geo+json',
          },
        }
      );

      const data = await res.json();

      return data as SubmissionApiGeoJsonPayload | undefined;
    },
    select: data => {
      data?.features.sort(
        (a, b) =>
          new Date(a.properties.parking_time).getTime() -
          new Date(b.properties.parking_time).getTime()
      );

      return data;
    },
    staleTime: Infinity, // Only fetch data once per app load
  });

  return query;
}
