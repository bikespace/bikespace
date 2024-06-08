import React from 'react';

import {FilterDateRange} from '../filter-date-range';
import {ReportSummary} from '../report-summary';

export function SidebarContentFilters() {
  return (
    <>
      <ReportSummary />
      <FilterDateRange />
    </>
  );
}
