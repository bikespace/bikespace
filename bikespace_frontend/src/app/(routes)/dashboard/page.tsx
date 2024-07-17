import React from 'react';

import {DashboardPage} from '@/components/dashboard';

import {SubmissionApiPayload} from '@/interfaces/Submission';

interface PageProps {
  submissions: SubmissionApiPayload[];
}

export default function Page({
  submissions,
}: PageProps) {
  return <DashboardPage submissions={submissions} />;
}

export async function getStaticProps() {
  const res = await fetch('https://api-dev.bikespace.ca/api/v2/submissions?limit=5000');

  const data = await res.json();

  return {
    props: {
      submissions: data.submissions,
    },
  };
}
