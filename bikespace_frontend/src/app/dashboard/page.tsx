import React from 'react';

import {DashboardPage} from '@/components/dashboard';

export default async function Page() {
  const res = await fetch(
    'https://api-dev.bikespace.ca/api/v2/submissions?limit=5000'
  );

  const data = await res.json();

  const submissions = data?.submissions ? data.submissions : [];

  return <DashboardPage submissions={submissions} />;
}
