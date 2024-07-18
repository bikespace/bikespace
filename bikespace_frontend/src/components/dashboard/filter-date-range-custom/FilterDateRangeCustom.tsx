import React, {useContext, useState, useEffect} from 'react';
import {DateTime} from 'luxon';

import {DateRangeInterval} from '@/interfaces/Submission';

import {
  SubmissionsDateRangeContext,
  SubmissionFiltersContext,
} from '../context';

import {SidebarButton} from '../sidebar-button';

import styles from './filter-date-range-custom.module.scss';

export function FilterDateRangeCustom() {
  const {first, last} = useContext(SubmissionsDateRangeContext);
  const {
    filters: {dateRange},
    setFilters,
  } = useContext(SubmissionFiltersContext);

  const [selectedDateRange, setSelectedDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: dateRange?.from || first,
    to: dateRange?.to || last,
  });

  const isoFirst = DateTime.fromJSDate(first!).toISODate();
  const isoLast = DateTime.fromJSDate(last!).toISODate();

  useEffect(() => {
    setSelectedDateRange(dateRange || {from: first, to: last});
  }, [dateRange]);

  return (
    <div className={styles.dateRangeCustom}>
      <div className={styles.dateInput}>
        <label htmlFor="filter-start-date">Start date:</label>
        <input
          type="date"
          id="filter-start-date"
          name="startDate"
          value={
            selectedDateRange.from
              ? formatHtmlDateValue(selectedDateRange.from)
              : isoFirst!
          }
          min={isoFirst!}
          max={isoLast!}
          onChange={e => {
            setSelectedDateRange(prev => ({
              ...prev,
              from: e.currentTarget.value
                ? new Date(`${e.currentTarget.value}T00:00:00`)
                : null,
            }));
          }}
        />
      </div>
      <div className={styles.dateInput}>
        <label htmlFor="filter-end-date">End date:</label>
        <input
          type="date"
          id="filter-end-date"
          name="endDate"
          value={
            selectedDateRange.to
              ? formatHtmlDateValue(selectedDateRange.to)
              : isoLast!
          }
          min={isoFirst!}
          max={isoLast!}
          onChange={e => {
            setSelectedDateRange(prev => ({
              ...prev,
              to: e.currentTarget.value
                ? new Date(`${e.currentTarget.value}T23:59:59`)
                : null,
            }));
          }}
        />
      </div>
      <SidebarButton
        type="button"
        onClick={() => {
          setFilters(prev => ({
            ...prev,
            dateRange: {
              from: selectedDateRange.from || first!,
              to: selectedDateRange.to || last!,
            },
            dateRangeInterval: DateRangeInterval.CustomRange,
          }));
        }}
      >
        Apply
      </SidebarButton>
    </div>
  );
}

const formatHtmlDateValue = (date: Date) => {
  return date
    .toLocaleDateString()
    .replace(/\//g, '-')
    .split('-')
    .map(str => (str.length === 1 ? `0${str}` : str))
    .join('-');
};
