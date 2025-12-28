import React from 'react';

import {useStore} from '@/states/store';

import {SidebarButton} from '@/components/shared-ui/sidebar-button';

import styles from './clear-filters-button.module.scss';

import clearFilterIcon from '@/assets/icons/clear-filter.svg';

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
      <img src={clearFilterIcon.src} alt="" />
      <span>Clear Filters</span>
    </SidebarButton>
  );
}
