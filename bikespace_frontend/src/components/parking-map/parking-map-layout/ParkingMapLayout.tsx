'use client';

import React from 'react';
import {QueryClientProvider} from '@tanstack/react-query';

import {queryClient} from '@/config/query-client';

import {DashboardHeader} from '@/components/dashboard/dashboard-header';
// import {Noscript} from '';

import styles from './parking-map-layout.module.scss';

export function ParkingMapLayout({children}: {children: React.ReactNode}) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={styles.parkingMapLayout}>
        <DashboardHeader />
        {children}
        {/* <Noscript /> */}
      </div>
    </QueryClientProvider>
  );
}
