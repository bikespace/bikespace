import React, {useState} from 'react';
import {DateRangeInterval} from '@/interfaces/Submission';
import {trackUmamiEvent} from '@/utils';
import {useAllSubmissionsDateRange} from '@/hooks';
import {useSubmissionsStore} from '@/states/store';
import {SidebarButton} from '../sidebar-button';
import styles from './filter-date-range-custom.module.scss';

export function FilterDateRangeCustom() {
  /* c8 ignore next 4 */
  const {dateRange, setFilters} = useSubmissionsStore(state => ({
    dateRange: state.filters.dateRange,
    setFilters: state.setFilters,
  }));

  const [startDateText, setStartDateText] = useState<string>(
    formatHtmlDateValue(new Date())
  );
  const [endDateText, setEndDateText] = useState<string>(
    formatHtmlDateValue(new Date())
  );

  /* `+ 'T00:00:00` and 'T23:59:59' are added here in part because of a known quirk with Date API - date-only text is interpreted as UTC and date-time text is interpreted in the user time zone. See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format */
  const startDateValue = new Date(startDateText + 'T00:00:00');
  const endDateValue = new Date(endDateText + 'T23:59:59.999');

  // validation checks
  const startDateIsValid = !isNaN(Number(startDateValue));
  const endDateIsValid = !isNaN(Number(endDateValue));
  const endDateNotBeforeStartDate = endDateValue > startDateValue;
  const inputIsValid =
    startDateIsValid && endDateIsValid && endDateNotBeforeStartDate;

  const errorMessages = [];
  if (!startDateIsValid) errorMessages.push('Please enter a valid start date.');
  if (!endDateIsValid) errorMessages.push('Please enter a valid end date.');
  if (startDateIsValid && endDateIsValid && !endDateNotBeforeStartDate)
    errorMessages.push('End date cannot be before start date.');

  const applyCustomDateRange = () => {
    setFilters({
      dateRange: {
        from: startDateValue,
        to: endDateValue,
      },
      dateRangeInterval: DateRangeInterval.CustomRange,
    });

    trackUmamiEvent('datefilter', {
      from: startDateText,
      to: endDateText,
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
          value={startDateText}
          onChange={e => setStartDateText(e.target.value)}
        />
      </div>
      <div className={styles.dateInput}>
        <label htmlFor="filter-end-date">End date:</label>
        <input
          type="date"
          id="filter-end-date"
          name="endDate"
          value={endDateText}
          onChange={e => setEndDateText(e.target.value)}
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

export const formatHtmlDateValue = (date: Date | null) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};
