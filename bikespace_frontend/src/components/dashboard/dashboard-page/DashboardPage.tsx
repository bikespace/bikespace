import React from 'react';

import {SubmissionApiPayload} from '@/interfaces/Submission';

import {DashboardHeader} from '../dashboard-header';
import {Map} from '../map';
import {Noscript} from '../noscript';

import * as styles from './dashboard-page.module.scss';

interface DashboardPageProps {
  submissions: SubmissionApiPayload[];
}

export function DashboardPage({submissions}: DashboardPageProps) {
  return (
    <div className={styles.dashboardPage}>
      <DashboardHeader />
      <main className={styles.main}>
        <Map submissions={submissions} />
      </main>
      <Noscript />
    </div>
  );
}
