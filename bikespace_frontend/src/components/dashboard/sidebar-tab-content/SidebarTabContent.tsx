import React, {useContext} from 'react';

import {TabContext, SubmissionsContext} from '../context';

import {ReportSummary} from '../report-summary';

import * as styles from './sidebar-tab-content.module.scss';
import {DateRangeFilter} from '../date-range-filter';

export function SidebarTabContent() {
  const tabContext = useContext(TabContext);
  const submissions = useContext(SubmissionsContext);

  return (
    <div className={styles.tabContent}>
      {tabContext?.tab !== 'feed' && <ReportSummary />}
      {submissions.length > 0 && tabContext?.tab === 'filters' && (
        <>
          <DateRangeFilter />
        </>
      )}
    </div>
  );
}
