import React, {useState, useEffect, useCallback} from 'react';
import {DateTime} from 'luxon';

import {DateRangeInterval} from '@/interfaces/Submission';

import {trackUmamiEvent} from '@/utils';

import {useAllSubmissionsDateRange} from '@/hooks';

import {useSubmissionsStore} from '@/states/store';

import {SidebarButton} from '../sidebar-button';

import styles from './filter-date-range-custom.module.scss';

export function FilterDateRangeCustom() {
  const {first, last} = useAllSubmissionsDateRange();
  const {dateRange, setFilters} = useSubmissionsStore(state => ({
    dateRange: state.filters.dateRange,
    setFilters: state.setFilters,
  }));

  const today = new Date();
  const defaultFirst = DateTime.fromJSDate(today).startOf('day').toJSDate();
  const defaultLast = DateTime.fromJSDate(today).endOf('day').toJSDate();

  const [selectedDateRange, setSelectedDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: defaultFirst,
    to: defaultLast,
  });

  const isoFirst = DateTime.fromJSDate(first!).toISODate();
  const isoLast = DateTime.fromJSDate(last!).toISODate();

  useEffect(() => {
    setSelectedDateRange(dateRange || {from: defaultFirst, to: defaultLast});
  }, [dateRange]);

  const handleFromChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedDateRange({
        from: e.currentTarget.value
          ? new Date(`${e.currentTarget.value}T00:00:00`)
          : null,
        to: selectedDateRange.to,
      });
    },
    [selectedDateRange.to]
  );

  const handleToChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedDateRange({
        from: selectedDateRange.from,
        to: e.currentTarget.value
          ? new Date(`${e.currentTarget.value}T23:59:59`)
          : null,
      });
    },
    [selectedDateRange.from]
  );

  function applyCustomDateRange() {
    setFilters({
      dateRange: {
        from: selectedDateRange.from,
        to: selectedDateRange.to,
      },
      dateRangeInterval: DateRangeInterval.CustomRange,
    });

    trackUmamiEvent('datefilter', {
      from: selectedDateRange.from ?? '',
      to: selectedDateRange.to ?? '',
      interval: DateRangeInterval.CustomRange,
    });
  }

  return (
    <div className={styles.dateRangeCustom}>
      <div className={styles.dateInput}>
        <label htmlFor="filter-start-date">Start date:</label>
        <input
          type="date"
          id="filter-start-date"
          name="startDate"
          value={formatHtmlDateValue(selectedDateRange.from || today)}
          min={isoFirst!}
          max={isoLast!}
          onChange={handleFromChange}
        />
      </div>
      <div className={styles.dateInput}>
        <label htmlFor="filter-end-date">End date:</label>
        <input
          type="date"
          id="filter-end-date"
          name="endDate"
          value={formatHtmlDateValue(selectedDateRange.to || today)}
          min={isoFirst!}
          max={isoLast!}
          onChange={handleToChange}
        />
      </div>
      <SidebarButton type="button" onClick={applyCustomDateRange}>
        Apply
      </SidebarButton>
    </div>
  );
}

export const formatHtmlDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};
