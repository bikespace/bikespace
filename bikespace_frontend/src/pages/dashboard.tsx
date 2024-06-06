import React from 'react';

import {DashboardPage} from '@/components/dashboard';
import {SubmissionApiPayload} from '@/interfaces/Submission';

interface DashboardRouteProps {
  serverData: {
    submissions: SubmissionApiPayload[];
  } | null;
}

export default function DashboardRoute({serverData}: DashboardRouteProps) {
  const submissions: SubmissionApiPayload[] = serverData?.submissions || [];

  return <DashboardPage submissions={submissions} />;
}

export async function getServerData() {
  try {
    const res = await fetch(
      'https://api-dev.bikespace.ca/api/v2/submissions?limit=5000'
    );

    const data = await res.json();

    return {
      props: data,
    };
  } catch (error) {
    return {
      props: null,
    };
  }
}
