import React, {useContext, useState} from 'react';
import {DateTime} from 'luxon';

import {
  SubmissionsDateRangeContext,
  SubmissionFiltersContext,
} from '../context';

import * as styles from './filter-date-range-custom.module.scss';

export function FilterDateRangeCustom() {
  const submissionsDateRange = useContext(SubmissionsDateRangeContext);
  const filters = useContext(SubmissionFiltersContext);

  const {first, last} = submissionsDateRange;

  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: first!,
    to: last!,
  });

  const isoFirst = DateTime.fromJSDate(first!).toISODate();
  const isoLast = DateTime.fromJSDate(last!).toISODate();

  return (
    <div className={styles.dateRangeCustom}>
      <div className={styles.dateInput}>
        <label htmlFor="filter-start-date">Start date:</label>
        <input
          type="date"
          id="filter-start-date"
          name="startDate"
          value={isoFirst!}
          min={isoFirst!}
          max={isoLast!}
          onChange={e => {
            setDateRange(prev => ({
              ...prev,
              from: e.currentTarget.value
                ? new Date(e.currentTarget.value)
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
          value={isoLast!}
          min={isoFirst!}
          max={isoLast!}
          onChange={e => {
            setDateRange(prev => ({
              ...prev,
              to: e.currentTarget.value
                ? new Date(e.currentTarget.value)
                : null,
            }));
          }}
        />
      </div>
      <button
        type="button"
        onClick={() => {
          filters?.setFilters(prev => ({
            ...prev,
            dateRange: {
              from: dateRange.from || first!,
              to: dateRange.to || last!,
            },
          }));
        }}
      >
        Apply
      </button>
    </div>
  );
}
