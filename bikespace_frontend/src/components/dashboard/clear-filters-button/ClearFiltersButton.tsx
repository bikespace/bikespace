import React, {useContext} from 'react';

import {SubmissionFiltersContext} from '../context';

import {SidebarButton} from '../sidebar-button';

import clearFilterIcon from '@/assets/icons/clear-filter.svg';

import styles from './clear-filters-button.module.scss';

export function ClearFiltersButton() {
  const {
    filters: {dateRange, parkingDuration, issue, day, dateRangeInterval},
    setFilters,
  } = useContext(SubmissionFiltersContext);

  if (
    parkingDuration.length === 0 &&
    (!dateRange || (dateRange.from === null && dateRange?.to === null)) &&
    !issue &&
    day === null &&
    dateRangeInterval === null
  )
    return null;

  return (
    <SidebarButton
      className={styles.button}
      onClick={() => {
        setFilters({
          dateRange: null,
          dateRangeInterval: null,
          parkingDuration: [],
          issue: null,
          day: null,
        });
      }}
    >
      <img src={clearFilterIcon} />
      <span>Clear Filters</span>
    </SidebarButton>
  );
}
