'use client';

import React from 'react';
import {QueryClientProvider} from '@tanstack/react-query';

import {queryClient} from '@/config/query-client';

import {DashboardHeader} from '@/components/dashboard/dashboard-header';

import styles from './biketheft-map-layout.module.scss';

export function BikeTheftMapLayout({children}: {children: React.ReactNode}) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={styles.bikeTheftMapLayout}>
        <DashboardHeader />
        {children}
      </div>
    </QueryClientProvider>
  );
}
