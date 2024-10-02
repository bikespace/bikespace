import React, {useState} from 'react';
import {DateTime} from 'luxon';

import {DateRangeInterval} from '@/interfaces/Submission';

import {trackUmamiEvent} from '@/utils';

import {useAllSubmissionsDateRange} from '@/hooks';

import {useSubmissionsStore} from '@/states/store';

import {getDateRangeFromInterval} from './utils';

import {FilterSection} from '../filter-section';
import {FilterDateRangeCustom} from '../filter-date-range-custom';

import styles from './filter-date-range.module.scss';

export function FilterDateRange() {
  const {dateRange, dateRangeInterval, setFilters} = useSubmissionsStore(
    state => ({
      dateRange: state.filters.dateRange,
      dateRangeInterval: state.filters.dateRangeInterval,
      setFilters: state.setFilters,
    })
  );
  const {first, last} = useAllSubmissionsDateRange();

  const [showCustomRange, setShowCustomRange] = useState<boolean>(false);

  return (
    <FilterSection title="Date Range">
      <div>
        <div>
          <strong>Showing between:</strong>
        </div>
        <div>
          {`${DateTime.fromJSDate(dateRange?.from || first!).toLocaleString(
            DateTime.DATE_FULL,
            {
              locale: 'en-CA',
            }
          )} - ${DateTime.fromJSDate(dateRange?.to || last!).toLocaleString(
            DateTime.DATE_FULL,
            {locale: 'en-CA'}
          )}`}
        </div>
      </div>
      <div className={styles.dateRangeSelect}>
        <label htmlFor="filter-date-range-select">
          <strong>Select:</strong>
        </label>
        <select
          name="dateRange"
          id="filter-date-range-select"
          value={dateRangeInterval || DateRangeInterval.AllDates}
          onChange={e => {
            const value = e.currentTarget.value as DateRangeInterval;

            if (value === DateRangeInterval.CustomRange) {
              setShowCustomRange(true);
            } else {
              setShowCustomRange(false);

              const dateRange = getDateRangeFromInterval(value);

              setFilters({
                dateRange,
                dateRangeInterval: value,
              });

              if (dateRange)
                trackUmamiEvent('datefilter', {
                  from: dateRange.from,
                  to: dateRange.to,
                  interval: value,
                });
            }
          }}
        >
          {dateRangeOptGroups.map(group => (
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
      <div hidden={!showCustomRange}>
        <FilterDateRangeCustom />
      </div>
    </FilterSection>
  );
}

const dateRangeOptGroups = [
  {
    label: 'All Dates',
    options: [
      {
        label: 'All Dates',
        value: DateRangeInterval.AllDates,
      },
    ],
  },
  {
    label: 'Days',
    options: [
      {
        label: 'Last 7 days',
        value: DateRangeInterval.Last7Days,
      },
      {
        label: 'Last 30 days',
        value: DateRangeInterval.Last30Days,
      },
      {
        label: 'Last 90 days',
        value: DateRangeInterval.Last90Days,
      },
    ],
  },
  {
    label: 'Year',
    options: [
      {
        label: 'Last 12 months',
        value: DateRangeInterval.Last12Months,
      },
      {
        label: 'This year',
        value: DateRangeInterval.ThisYear,
      },
      {
        label: 'Last year',
        value: DateRangeInterval.LastYear,
      },
    ],
  },
  {
    label: 'Custom',
    options: [
      {
        label: 'Custom range',
        value: DateRangeInterval.CustomRange,
      },
    ],
  },
];
