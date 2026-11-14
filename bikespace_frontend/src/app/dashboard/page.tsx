'use client';

import {Suspense} from 'react';

import {DashboardPage} from '@/components/dashboard';

// DashboardPage reads URL search params (via nuqs), which requires a
// Suspense boundary for static export.
export default function Page() {
  return (
    <Suspense>
      <DashboardPage />
    </Suspense>
  );
}
