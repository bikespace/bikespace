'use client';

import {DashboardPage} from '@/components/dashboard';
import {Suspense} from 'react';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <DashboardPage />
    </Suspense>
  );
}
