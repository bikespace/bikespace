import React, {useContext, useState, useEffect} from 'react';
import {DateTime} from 'luxon';

import {FixedDateRange} from './types';

import {getDateRangeFromFixedRange} from './utils';

import {
  SubmissionFiltersContext,
  SubmissionsDateRangeContext,
} from '../context';

import {FilterSection} from '../filter-section';
import {CustomDateRangeFilter} from '../custom-date-range-filter';

import * as styles from './date-range-filter.module.scss';

export function FilterDateRange() {
  const submissionFilters = useContext(SubmissionFiltersContext);
  const submissionsDateRange = useContext(SubmissionsDateRangeContext);

  const [dateRange, setDateRange] = useState<{from: Date; to: Date} | null>({
    from:
      submissionFilters?.filters.dateRange?.from || submissionsDateRange.first!,
    to: submissionFilters?.filters.dateRange?.to || submissionsDateRange.last!,
  });
  const [selectedRange, setSelectedRange] = useState<FixedDateRange>(
    FixedDateRange.AllDates
  );

  useEffect(() => {
    if (selectedRange === FixedDateRange.CustomRange) return;

    setDateRange(getDateRangeFromFixedRange(selectedRange));
  }, [selectedRange]);

  useEffect(() => {
    submissionFilters?.setFilters(prev => ({
      ...prev,
      dateRange,
    }));
  }, [dateRange]);

  return (
    <FilterSection title="Date Range">
      <div>
        <div>
          <strong>Showing between:</strong>
        </div>
        <div className={styles.dateRange}>
          {`${DateTime.fromJSDate(
            dateRange?.from || submissionsDateRange.first!
          ).toLocaleString(DateTime.DATE_FULL, {
            locale: 'en-CA',
          })} - ${DateTime.fromJSDate(
            dateRange?.to || submissionsDateRange.last!
          ).toLocaleString(DateTime.DATE_FULL, {locale: 'en-CA'})}`}
        </div>
      </div>
      <div>
        <label htmlFor="filter-date-range-select">
          <strong>Select:</strong>
        </label>
        <select
          name="dateRange"
          id="filter-date-range-select"
          onChange={e => {
            setSelectedRange(e.currentTarget.value as FixedDateRange);
          }}
        >
          {dateRangeOptgroups.map(group => (
            <optgroup label={group.label} key={group.label}>
              {group.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div hidden={selectedRange !== FixedDateRange.CustomRange}>
        <CustomDateRangeFilter />
      </div>
    </FilterSection>
  );
}

const dateRangeOptgroups = [
  {
    label: 'All Dates',
    options: [
      {
        label: 'All Dates',
        value: FixedDateRange.AllDates,
      },
    ],
  },
  {
    label: 'Days',
    options: [
      {
        label: 'Last 7 days',
        value: FixedDateRange.Last7Days,
      },
      {
        label: 'Last 30 days',
        value: FixedDateRange.Last30Days,
      },
      {
        label: 'Last 90 days',
        value: FixedDateRange.Last90Days,
      },
    ],
  },
  {
    label: 'Year',
    options: [
      {
        label: 'Last 12 months',
        value: FixedDateRange.Last12Months,
      },
      {
        label: 'This year',
        value: FixedDateRange.ThisYear,
      },
      {
        label: 'Last year',
        value: FixedDateRange.LastYear,
      },
    ],
  },
  {
    label: 'Custom',
    options: [
      {
        label: 'Custom range',
        value: FixedDateRange.CustomRange,
      },
    ],
  },
];
