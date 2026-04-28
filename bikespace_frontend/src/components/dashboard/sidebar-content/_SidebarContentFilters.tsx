import React from 'react';

import {FilterDateRange} from '../filter-date-range';
import {ReportSummary} from '../report-summary';
import {FilterParkingDuration} from '../filter-parking-duration';
import {FilterIssueType} from '../filter-issue-type';

export function SidebarContentFilters() {
  return (
    <>
      <ReportSummary />
      <FilterDateRange />
      <FilterIssueType />
      <FilterParkingDuration />
    </>
  );
}
