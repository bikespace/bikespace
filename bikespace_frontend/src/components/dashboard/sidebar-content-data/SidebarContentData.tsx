import React from 'react';

import {ReportSummary} from '../report-summary';
import {DataIssueFrequencyChart} from '../data-issue-frequency-chart';
import {DataFrequencyByDayChart} from '../data-frequency-by-day-chart';

import * as styles from './sidebar-content-data.module.scss';

export function SidebarContentData() {
  return (
    <>
      <ReportSummary />
      <DataIssueFrequencyChart className={styles.chart} />
      <DataFrequencyByDayChart className={styles.chart} />
    </>
  );
}
