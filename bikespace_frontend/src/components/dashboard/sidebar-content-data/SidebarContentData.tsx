import React from 'react';

import {ReportSummary} from '../report-summary';
import {DataIssueFrequencyChart} from '../data-issue-frequency-chart';

export function SidebarContentData() {
  return (
    <>
      <ReportSummary />
      <DataIssueFrequencyChart />
    </>
  );
}
