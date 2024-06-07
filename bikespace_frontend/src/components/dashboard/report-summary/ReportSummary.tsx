import React from 'react';
import {DateTime} from 'luxon';

import {SubmissionApiPayload} from '@/interfaces/Submission';

import {SubmissionFiltersContext} from '../context';

import warningIcon from '@/assets/icons/exclamation-triangle.svg';

import * as styles from './report-summary.module.scss';

interface ReportSummaryProps {
  submissions: SubmissionApiPayload[];
}

export function ReportSummary({submissions}: ReportSummaryProps) {
  const submissionDates = submissions.map(
    submission => new Date(submission.parking_time)
  );

  submissionDates.sort((a, b) => a.getTime() - b.getTime());

  const earliestEntry = DateTime.fromJSDate(submissionDates[0]).toLocaleString(
    DateTime.DATE_FULL,
    {locale: 'en-CA'}
  );
  const latestEntry = DateTime.fromJSDate(
    submissionDates[submissionDates.length - 1]
  ).toLocaleString(DateTime.DATE_FULL, {locale: 'en-CA'});

  return (
    <SubmissionFiltersContext.Consumer>
      {filtersContext => (
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
                ? ` reports ${filtersContext?.filters ? ' (filtered)' : ''}`
                : 'No reports match filter criteria'}
            </span>
          </div>
          <div>
            {submissions.length > 0
              ? `${earliestEntry} - ${latestEntry}`
              : 'Date Range N/A'}
          </div>
        </div>
      )}
    </SubmissionFiltersContext.Consumer>
  );
}
