import React, {useState, useEffect} from 'react';
import {DateTime} from 'luxon';

import {DateRangeInterval} from '@/interfaces/Submission';

import {trackUmamiEvent} from '@/utils';

import {useSubmissionsStore} from '@/states/store';

import {SidebarButton} from '../sidebar-button';

import styles from './filter-date-range-custom.module.scss';

export function FilterDateRangeCustom() {
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

  useEffect(() => {
    setSelectedDateRange({
      from: dateRange.from ?? defaultFirst,
      to: dateRange.to ?? defaultLast,
    });
  }, [dateRange]);

  // validation checks
  const startDateIsValid = Number(selectedDateRange.from) > 0;
  const endDateIsValid = Number(selectedDateRange.to) > 0;
  const endDateNotBeforeStartDate =
    selectedDateRange.to! > selectedDateRange.from!;
  const inputIsValid =
    startDateIsValid && endDateIsValid && endDateNotBeforeStartDate;

  const errorMessages = [];
  if (!startDateIsValid) errorMessages.push('Please enter a valid start date.');
  if (!endDateIsValid) errorMessages.push('Please enter a valid end date.');
  if (startDateIsValid && endDateIsValid && !endDateNotBeforeStartDate)
    errorMessages.push('End date cannot be before start date.');

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDateRange({
      from: e.currentTarget.value
        ? new Date(`${e.currentTarget.value}T00:00:00`)
        : null,
      to: selectedDateRange.to,
    });
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDateRange({
      from: selectedDateRange.from,
      to: e.currentTarget.value
        ? new Date(`${e.currentTarget.value}T23:59:59`)
        : null,
    });
  };

  const applyCustomDateRange = () => {
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
  };

  return (
    <div className={styles.dateRangeCustom}>
      <div className={styles.dateInput}>
        <label htmlFor="filter-start-date">Start date:</label>
        <input
          type="date"
          id="filter-start-date"
          name="startDate"
          value={formatHtmlDateValue(selectedDateRange.from ?? null)}
          onChange={handleFromChange}
        />
      </div>
      <div className={styles.dateInput}>
        <label htmlFor="filter-end-date">End date:</label>
        <input
          type="date"
          id="filter-end-date"
          name="endDate"
          value={formatHtmlDateValue(selectedDateRange.to ?? null)}
          onChange={handleToChange}
        />
      </div>
      <SidebarButton
        type="button"
        onClick={applyCustomDateRange}
        disabled={!inputIsValid}
      >
        Apply
      </SidebarButton>
      {errorMessages.length > 0 ? (
        <p className={styles.errorMessages}>{errorMessages.join(' ')}</p>
      ) : null}
    </div>
  );
}

export const formatHtmlDateValue = (date: Date | null): string => {
  if (date === null) return '';

  return DateTime.fromJSDate(date).toFormat('yyyy-LL-dd');
};
