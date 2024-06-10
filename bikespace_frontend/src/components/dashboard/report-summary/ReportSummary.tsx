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
  const {filters} = useContext(SubmissionFiltersContext)!;
  const {first, last} = useContext(SubmissionsDateRangeContext)!;

  const earliestEntry = DateTime.fromJSDate(
    filters.dateRange?.from || first!
  ).toLocaleString(DateTime.DATE_FULL, {locale: 'en-CA'});
  const latestEntry = DateTime.fromJSDate(
    filters.dateRange?.to || last!
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
                filters.dateRange === null && filters.parkingDuration === null
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
