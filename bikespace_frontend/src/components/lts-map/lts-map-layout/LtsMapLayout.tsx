'use client';

import React from 'react';
import {QueryClientProvider} from '@tanstack/react-query';

import {queryClient} from '@/config/query-client';

import {DashboardHeader} from '@/components/dashboard/dashboard-header';

import styles from './lts-map-layout.module.scss';

export function LtsMapLayout({children}: {children: React.ReactNode}) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={styles.ltsMapLayout}>
        <DashboardHeader />
        {children}
      </div>
    </QueryClientProvider>
  );
}
