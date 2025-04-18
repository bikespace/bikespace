import React from 'react';

import {FilterDateRange} from '../filter-date-range';
import {ReportSummary} from '../report-summary';
import {FilterParkingDuration} from '../filter-parking-duration';

import styles from './_SidebarContent.module.scss';

export function SidebarContentFilters() {
  return (
    <>
      <ReportSummary />
      <FilterDateRange />
      <FilterParkingDuration />
    </>
  );
}
