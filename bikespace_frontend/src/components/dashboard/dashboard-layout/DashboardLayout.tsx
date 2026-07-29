'use client';

import React from 'react';
import {QueryClientProvider} from '@tanstack/react-query';
import {NuqsAdapter} from 'nuqs/adapters/next/app';

import {queryClient} from '@/config/query-client';

import {DashboardHeader} from '../dashboard-header';
import {Noscript} from '../noscript';

import styles from './dashboard-layout.module.scss';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({children}: DashboardLayoutProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <div className={styles.dashboardLayout}>
          <DashboardHeader />
          {children}
          <Noscript />
        </div>
      </NuqsAdapter>
    </QueryClientProvider>
  );
}
