import React from 'react';

import {DashboardHeader} from '../dashboard-header';
import {Map} from '../map';
import {Noscript} from '../noscript';

import * as styles from './dashboard-page.module.scss';

export function DashboardPage() {
  return (
    <div className={styles.dashboardPage}>
      <DashboardHeader />
      <main className={styles.main}>
        <Map />
      </main>
      <Noscript />
    </div>
  );
}
