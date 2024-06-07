import React, {useState} from 'react';

import {SubmissionApiPayload} from '@/interfaces/Submission';

import {DashboardContext} from '../context';

import {DashboardHeader} from '../dashboard-header';
import {Map} from '../map';
import {Noscript} from '../noscript';
import {Sidebar} from '../sidebar';

import * as styles from './dashboard-page.module.scss';

interface DashboardPageProps {
  submissions: SubmissionApiPayload[];
}

export function DashboardPage({submissions}: DashboardPageProps) {
  const [tab, setTab] = useState<string>('data');

  return (
    <DashboardContext.Provider
      value={{
        tabState: {tab, setTab},
      }}
    >
      <div className={styles.dashboardPage}>
        <DashboardHeader />
        <main className={styles.main}>
          <Sidebar />
          <Map submissions={submissions} />
        </main>
        <Noscript />
      </div>
    </DashboardContext.Provider>
  );
}
