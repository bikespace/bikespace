import React, {forwardRef} from 'react';
import {DateTime} from 'luxon';

import {SubmissionApiPayload, ParkingDuration} from '@/interfaces/Submission';
import {issuePriority} from '@/config/bikespace-api';

import {IssueBadge} from '../issue-badge';

import styles from './feed-submission-item.module.scss';

const parkingDurationDescription = {
  [ParkingDuration.Minutes]: 'less than an hour',
  [ParkingDuration.Hours]: 'several hours',
  [ParkingDuration.Overnight]: 'overnight',
  [ParkingDuration.MultiDay]: 'several days',
};

export interface FeedSubmissionItemProps {
  submission: SubmissionApiPayload;
  isFocused: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export const FeedSubmissionItem = forwardRef(
  (
    {submission, isFocused, onClick}: FeedSubmissionItemProps,
    ref: React.ForwardedRef<HTMLButtonElement>
  ) => {
    const {
      id,
      issues,
      parking_time,
      parking_duration,
      comments,
      submitted_datetime,
    } = submission;

    const parkingTime = new Date(parking_time + '+00:00');
    const submittedDateTime = submitted_datetime
      ? new Date(submitted_datetime) // submitted_datetime already has a tz offset
      : 'Not Recorded';
    const timeDescriptionTitle = [
      'Encountered: ',
      parkingTime.toLocaleString(),
      '\nSubmitted: ',
      submittedDateTime.toLocaleString(),
    ].join(' ');

    return (
      <button
        ref={ref}
        className={`${styles.item} ${isFocused ? styles.focused : ''}`}
        onClick={onClick}
      >
        <h3 title={timeDescriptionTitle}>
          {DateTime.fromJSDate(parkingTime).toLocaleString(
            {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'},
            {locale: 'en-CA'}
          )}
        </h3>
        <div className={styles.subHeader}>
          <span>
            {DateTime.fromJSDate(parkingTime).toRelativeCalendar()} •{' '}
            {DateTime.fromJSDate(parkingTime).toLocaleString(
              DateTime.TIME_SIMPLE,
              {locale: 'en-CA'}
            )}
          </span>

          <span className={styles.submissionId}>
            <a
              href={`${window.location.host}${window.location.pathname}?submission_id=${submission.id}`}
            >
              ID: {submission.id}
            </a>
          </span>
        </div>
        <div className={styles.issues}>
          {
            // de-duplicate issue list: guard for old incorrect entries where same issue was selected more than once
            [...new Set(issues)]
              .sort((a, b) => issuePriority[a] - issuePriority[b])
              .map(issue => (
                <IssueBadge issue={issue} key={issue} />
              ))
          }
        </div>
        <p>
          <strong>Wanted to park for: </strong>
          {parkingDurationDescription[parking_duration] ?? 'unknown'}
        </p>
        {comments && (
          <p>
            <strong>Comments: </strong>
            {comments}
          </p>
        )}
      </button>
    );
  }
);
