'use client';

import React from 'react';
import {QueryClientProvider} from '@tanstack/react-query';

import {queryClient} from '@/config/query-client';

import {DashboardHeader} from '@/components/dashboard/dashboard-header';
// import {Noscript} from '';

import styles from './imagery-map-layout.module.scss';

export function ImageryMapLayout({children}: {children: React.ReactNode}) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={styles.imageryMapLayout}>
        <DashboardHeader />
        {children}
        {/* <Noscript /> */}
      </div>
    </QueryClientProvider>
  );
}
