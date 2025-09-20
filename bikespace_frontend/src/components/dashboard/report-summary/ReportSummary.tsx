import React, {useState, useEffect} from 'react';
import {DateTime} from 'luxon';

import {useStore} from '@/states/store';

import {useAllSubmissionsDateRange, useSubmissionsQuery} from '@/hooks';

import warningIcon from '@/assets/icons/exclamation-triangle.svg';

import {Spinner} from '../../spinner/Spinner';

import styles from './report-summary.module.scss';

export function ReportSummary() {
  const {isFetching} = useSubmissionsQuery();

  const {submissions, filters} = useStore(state => ({
    submissions: state.submissions,
    filters: state.filters,
  }));

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
