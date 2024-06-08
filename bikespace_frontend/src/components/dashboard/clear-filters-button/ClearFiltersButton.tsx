import React, {useContext} from 'react';

import {SubmissionFiltersContext} from '../context';

import {SidebarButton} from '../sidebar-button';

import clearFilterIcon from '@/assets/icons/clear-filter.svg';

import * as styles from './clear-filters-button.module.scss';

export function ClearFiltersButton() {
  const filtersContext = useContext(SubmissionFiltersContext);

  if (!filtersContext) return null;

  const {
    filters: {dateRange, parkingDuration},
    setFilters,
  } = filtersContext;

  if (
    (!parkingDuration || parkingDuration.length === 0) &&
    (!dateRange || (dateRange.from === null && dateRange?.to === null))
  )
    return null;

  return (
    <SidebarButton
      className={styles.button}
      onClick={() => {
        setFilters({
          dateRange: null,
          parkingDuration: null,
        });
      }}
    >
      <img src={clearFilterIcon} />
      <span>Clear Filters</span>
    </SidebarButton>
  );
}
