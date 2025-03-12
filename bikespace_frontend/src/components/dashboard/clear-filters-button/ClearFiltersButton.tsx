import React from 'react';

import {useStore} from '@/states/store';

import {SidebarButton} from '../sidebar-button';

import clearFilterIcon from '@/assets/icons/clear-filter.svg';

import styles from './clear-filters-button.module.scss';

export function ClearFiltersButton() {
  const {
    filters: {dateRange, parkingDuration, issue, day, dateRangeInterval},
    setFilters,
  } = useStore(state => ({
    filters: state.filters,
    setFilters: state.setFilters,
  }));

  if (
    parkingDuration.length === 0 &&
    dateRange.from === null &&
    dateRange.to === null &&
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
          dateRange: {from: null, to: null},
          dateRangeInterval: null,
          parkingDuration: [],
          issue: null,
          day: null,
        });
      }}
      umamiEvent="clear-filters"
    >
      <img src={clearFilterIcon.src} />
      <span>Clear Filters</span>
    </SidebarButton>
  );
}
