import React from 'react';
import {DateTime} from 'luxon';

import {SubmissionApiPayload, ParkingDuration} from '@/interfaces/Submission';

import {IssueBadge} from '../issue-badge';

import * as styles from './feed-submision-item.module.scss';

interface FeedSubmissionItemProps {
  submission: SubmissionApiPayload;
}

export function FeedSubmissionItem({submission}: FeedSubmissionItemProps) {
  const {issues, parking_time, parking_duration, comments} = submission;

  const parkingTime = new Date(parking_time);

  const handleClick = () => {
    console.log('TODO: focus to map pin');
  };

  return (
    <button className={styles.item} onClick={handleClick}>
      <h3>
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
        <span className={styles.submissionId}>ID: {submission.id}</span>
      </div>
      <div className="issues">
        {[...new Set(issues)].map(issue => (
          <IssueBadge issue={issue} key={issue} />
        ))}
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

const parkingDurationDescription = {
  [ParkingDuration.Minutes]: 'less than an hour',
  [ParkingDuration.Hours]: 'several hours',
  [ParkingDuration.Overnight]: 'overnight',
  [ParkingDuration.MultiDay]: 'several days',
};
