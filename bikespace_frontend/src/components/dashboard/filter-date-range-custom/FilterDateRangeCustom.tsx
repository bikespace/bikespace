import React, {useState} from 'react';
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

  const isoFirst = formatHtmlDateValue(first);
  const isoLast = formatHtmlDateValue(last);
  const [startDateValue, setStartDateValue] = useState<string>(
    formatHtmlDateValue(new Date())
  );
  const [endDateValue, setEndDateValue] = useState<string>(
    formatHtmlDateValue(new Date())
  );

  // endDate should not be before startDate
  if (
    new Date(endDateValue + 'T00:00:00') <
    new Date(startDateValue + 'T00:00:00')
  ) {
    setEndDateValue(startDateValue);
  }

  /* `+ 'T00:00:00` is added here because of a known quirk with Date API - date-only text is interpreted as UTC and date-time text is interpreted in the user time zone. See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format */
  const applyCustomDateRange = () => {
    setFilters({
      dateRange: {
        from: new Date(startDateValue + 'T00:00:00'),
        to: new Date(endDateValue + 'T00:00:00'),
      },
      dateRangeInterval: DateRangeInterval.CustomRange,
    });

    trackUmamiEvent('datefilter', {
      from: startDateValue,
      to: endDateValue,
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
          value={startDateValue}
          min={isoFirst!}
          max={isoLast!}
          onChange={e => setStartDateValue(e.target.value)}
        />
      </div>
      <div className={styles.dateInput}>
        <label htmlFor="filter-end-date">End date:</label>
        <input
          type="date"
          id="filter-end-date"
          name="endDate"
          value={endDateValue}
          min={isoFirst || ''}
          max={isoLast || ''}
          onChange={e => setEndDateValue(e.target.value)}
        />
      </div>
      <SidebarButton type="button" onClick={applyCustomDateRange}>
        Apply
      </SidebarButton>
    </div>
  );
}

export const formatHtmlDateValue = (date: Date | null) => {
  if (date === null) return '';
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};
