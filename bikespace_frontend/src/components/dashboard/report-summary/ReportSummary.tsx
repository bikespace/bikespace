import React, {useState, useEffect, useRef} from 'react';
import {DateTime} from 'luxon';

import {useStore} from '@/states/store';
import {useAllSubmissionsDateRange, useSubmissionsQuery} from '@/hooks';

import {Spinner} from '@/components/shared-ui/spinner';

import styles from './report-summary.module.scss';

import warningIcon from '@/assets/icons/exclamation-triangle.svg';

export function ReportSummary({onReady}: {onReady?: () => void}) {
  const {isFetching} = useSubmissionsQuery();

  const {submissions, filters} = useStore(state => ({
    submissions: state.submissions,
    filters: state.filters,
  }));

  const hasFiredReadyRef = useRef(false);

  useEffect(() => {
    // Guard against calling onReady multiple times
    if (!isFetching && !hasFiredReadyRef.current) {
      hasFiredReadyRef.current = true;
      onReady?.(); // Call onReady only once when all data is fetched
    }
  }, [isFetching, onReady]);

  const {first, last} = useAllSubmissionsDateRange();

  const [dateRange, setDateRange] = useState({
    from: first!,
    to: last!,
  });

  useEffect(() => {
    if (submissions.length === 0) return;

    setDateRange({
      from: new Date(submissions[0].parking_time + '+00:00'),
      to: new Date(submissions[submissions.length - 1].parking_time + '+00:00'),
    });
  }, [submissions]);

  const earliestEntry = DateTime.fromJSDate(dateRange.from).toLocaleString(
    DateTime.DATE_FULL,
    {locale: 'en-CA'}
  );
  const latestEntry = DateTime.fromJSDate(dateRange.to).toLocaleString(
    DateTime.DATE_FULL,
    {locale: 'en-CA'}
  );

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
          {submissions.length > 0
            ? ` reports ${
                filters.dateRange.from === null &&
                filters.dateRange.to === null &&
                filters.dateRangeInterval === null &&
                filters.issue === null &&
                filters.parkingDuration.length === 0 &&
                filters.day === null
                  ? ''
                  : ' (filtered)'
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
