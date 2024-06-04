import React from 'react';

import {DashboardHeader} from '@/components/dashboard';

import * as styles from './dashboard-page.module.scss';

export function DashboardPage() {
  return (
    <main className={styles.dashboardPage}>
      <DashboardHeader />
    </main>
  );
}
