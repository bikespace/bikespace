import React, {useEffect, useRef} from 'react';
import {DateTime} from 'luxon';

import {useStore} from '@/states/store';

import {Spinner} from '@/components/shared-ui/spinner';

import styles from './report-summary.module.scss';

import warningIcon from '@/assets/icons/exclamation-triangle.svg';

export function ReportSummary({onReady}: {onReady?: () => void}) {
  const {submissions, filters, isFetching} = useStore(state => ({
    submissions: state.submissions,
    filters: state.filters,
    isFetching: state.ui.loading.isFullDataLoading,
  }));

  const hasFiredReadyRef = useRef(false);

  useEffect(() => {
    // Guard against calling onReady multiple times
    if (!isFetching && !hasFiredReadyRef.current) {
      hasFiredReadyRef.current = true;
      onReady?.(); // Call onReady only once when all data is fetched
    }
  }, [isFetching, onReady]);

  // relies on submissions from useSubmissionsQuery being pre-sorted by date
  const dateRangeFrom =
    submissions.length > 0
      ? new Date(submissions[0].parking_time + '+00:00')
      : null;
  const dateRangeTo =
    submissions.length > 0
      ? new Date(submissions[submissions.length - 1].parking_time + '+00:00')
      : null;
  const earliestEntry = dateRangeFrom
    ? DateTime.fromJSDate(dateRangeFrom).toLocaleString(DateTime.DATE_FULL, {
        locale: 'en-CA',
      })
    : 'N/A';
  const latestEntry = dateRangeTo
    ? DateTime.fromJSDate(dateRangeTo).toLocaleString(DateTime.DATE_FULL, {
        locale: 'en-CA',
      })
    : 'N/A';

  if (isFetching) {
    return (
      <div className={styles.loading}>
        <Spinner label="Loading reports..." />
      </div>
    );
  }

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
            src={warningIcon.src}
            alt="warning icon"
          />
        )}
        <span>
          {' '}
          {submissions.length > 0
            ? ` reports ${
                filters.dateRange.from === null &&
                filters.dateRange.to === null &&
                filters.dateRangeInterval === null &&
                filters.issue === null &&
                filters.parkingDuration.length === 0 &&
                filters.day === null
                  ? ''
                  : '(filtered)'
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
