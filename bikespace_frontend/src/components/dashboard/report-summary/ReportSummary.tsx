import React, {useContext} from 'react';
import {DateTime} from 'luxon';

import {
  SubmissionFiltersContext,
  SubmissionsContext,
  SubmissionsDateRangeContext,
} from '../context';

import warningIcon from '@/assets/icons/exclamation-triangle.svg';

import * as styles from './report-summary.module.scss';

export function ReportSummary() {
  const submissions = useContext(SubmissionsContext);
  const filtersContext = useContext(SubmissionFiltersContext);
  const submissionsDateRange = useContext(SubmissionsDateRangeContext);

  const earliestEntry = DateTime.fromJSDate(
    filtersContext?.filters.dateRange?.from || submissionsDateRange.first!
  ).toLocaleString(DateTime.DATE_FULL, {locale: 'en-CA'});
  const latestEntry = DateTime.fromJSDate(
    filtersContext?.filters.dateRange?.to || submissionsDateRange.last!
  ).toLocaleString(DateTime.DATE_FULL, {locale: 'en-CA'});

  return (
    <div className={styles.summary}>
      <div>
        {submissions.length > 0 ? (
          <span className={styles.entryCount}>
            {submissions.length.toLocaleString('en-CA')}
          </span>
        ) : (
          <img
            className={styles.warningIcon}
            src={warningIcon}
            alt="warning icon"
          />
        )}
        <span>
          {submissions.length > 0
            ? ` reports ${
                filtersContext?.filters.dateRange === null &&
                filtersContext?.filters.parkingDuration === null
                  ? ' (filtered)'
                  : ''
              }`
            : 'No reports match filter criteria'}
        </span>
      </div>
      <div>
        {submissions.length > 0
          ? `${earliestEntry} - ${latestEntry}`
          : 'Date Range N/A'}
      </div>
    </div>
  );
}
