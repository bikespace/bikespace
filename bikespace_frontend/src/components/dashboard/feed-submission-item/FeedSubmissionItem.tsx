import React, {useContext, useEffect, useRef} from 'react';
import {DateTime} from 'luxon';

import {SubmissionApiPayload, ParkingDuration} from '@/interfaces/Submission';

import {FocusedSubmissionIdContext} from '../context';

import {IssueBadge} from '../issue-badge';

import * as styles from './feed-submision-item.module.scss';

interface FeedSubmissionItemProps {
  submission: SubmissionApiPayload;
}

export function FeedSubmissionItem({submission}: FeedSubmissionItemProps) {
  const {focus, setFocus} = useContext(FocusedSubmissionIdContext);

  const {id, issues, parking_time, parking_duration, comments} = submission;

  const parkingTime = new Date(parking_time);

  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (focus !== id) return;

    buttonRef.current?.scrollIntoView();
  }, [focus]);

  return (
    <button
      ref={buttonRef}
      className={`${styles.item} ${focus === id ? styles.focused : ''}`}
      onClick={() => {
        setFocus(id);
      }}
    >
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
