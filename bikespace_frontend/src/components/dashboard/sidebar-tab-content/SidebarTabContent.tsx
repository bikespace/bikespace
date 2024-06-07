import React from 'react';

import {SubmissionApiPayload} from '@/interfaces/Submission';

import {TabContext} from '../context';

import {ReportSummary} from '../report-summary';

import * as styles from './sidebar-tab-content.module.scss';

interface SidebarTabContentProps {
  submissions: SubmissionApiPayload[];
}

export function SidebarTabContent({submissions}: SidebarTabContentProps) {
  return (
    <div className={styles.tabContent}>
      <TabContext.Consumer>
        {tabContext => (
          <div>
            {tabContext?.tab !== 'feed' && (
              <ReportSummary submissions={submissions} />
            )}
          </div>
        )}
      </TabContext.Consumer>
    </div>
  );
}
