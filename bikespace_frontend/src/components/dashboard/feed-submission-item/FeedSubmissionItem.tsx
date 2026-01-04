import React, {useEffect, useRef} from 'react';
import {DateTime} from 'luxon';

import {SubmissionApiPayload, ParkingDuration} from '@/interfaces/Submission';
import {useIsMobile} from '@/hooks/use-is-mobile';

import {useSubmissionId} from '@/states/url-params';
import {useStore} from '@/states/store';

import {issuePriority} from '@/config/bikespace-api';

import {IssueBadge} from '../issue-badge';

import styles from './feed-submision-item.module.scss';

interface FeedSubmissionItemProps {
  submission: SubmissionApiPayload;
}

export function FeedSubmissionItem({submission}: FeedSubmissionItemProps) {
  const submissions = useStore(state => state.submissions);
  const isMobile = useIsMobile();

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

  const buttonRef = useRef<HTMLButtonElement>(null);

  const [focus, setFocus] = useSubmissionId();

  // scroll selected item into view when:
  // - focus changes
  // - submissions change (e.g. more are loaded)
  // - viewport changes from desktop to mobile or vice versa
  useEffect(() => {
    if (!(focus === id)) return;

    buttonRef.current?.scrollIntoView();
  }, [focus, submissions, isMobile]);

  const handleClick = () => {
    setFocus(id);
  };

  return (
    <button
      ref={buttonRef}
      className={`${styles.item} ${focus === id ? styles.focused : ''}`}
      onClick={handleClick}
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
        <span className={styles.submissionId}>ID: {submission.id}</span>
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

const parkingDurationDescription = {
  [ParkingDuration.Minutes]: 'less than an hour',
  [ParkingDuration.Hours]: 'several hours',
  [ParkingDuration.Overnight]: 'overnight',
  [ParkingDuration.MultiDay]: 'several days',
};
