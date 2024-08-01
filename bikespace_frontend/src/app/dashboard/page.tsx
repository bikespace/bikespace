'use client';

import React from 'react';
import {useQuery} from '@tanstack/react-query';

import {DashboardPage} from '@/components/dashboard';
import {SubmissionApiPayload} from '@/interfaces/Submission';

export default function Page() {
  const query = useQuery({
    queryKey: ['submissions'],
    queryFn: async () => {
      const res = await fetch(
        'https://api-dev.bikespace.ca/api/v2/submissions?limit=5000'
      );

      const data = await res.json();

      const submissions: SubmissionApiPayload[] = data.submissions || [];

      submissions.sort(
        (a, b) =>
          new Date(b.parking_time).getTime() -
          new Date(a.parking_time).getTime()
      );

      return submissions;
    },
  });

  return <DashboardPage queryResult={query} />;
}
