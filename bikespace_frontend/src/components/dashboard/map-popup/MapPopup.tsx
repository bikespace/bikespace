import React from 'react';
import {Popup} from 'react-leaflet';
import {SubmissionApiPayload} from '@/interfaces/Submission';
import {Link} from 'gatsby';

import {issuePriority} from '@/config/bikespace-api';

import * as styles from './map-popup.module.scss';

interface MapPopupProps {
  submission: SubmissionApiPayload;
}

export function MapPopup({submission}: MapPopupProps) {
  const {issues, id, comments, parking_duration, parking_time} = submission;

  const formattedParkingTime = new Date(parking_time).toLocaleString('en-CA', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return (
    <Popup>
      <div className={styles.popup}>
        <strong>Issues:</strong>
        {issues ? (
          <div className={styles.issues}>
            {issues
              .sort((a, b) => issuePriority[a] - issuePriority[b])
              .map(issue =>
                popupIssueLabels[issue] ? (
                  <div
                    className={`${styles.issue} ${styles[issue]}`}
                    key={issue}
                  >
                    {popupIssueLabels[issue]}
                  </div>
                ) : (
                  <div className={styles.issue} key={issue}>
                    {issue}
                  </div>
                )
              )}
          </div>
        ) : (
          <em>none</em>
        )}
      </div>
      <p>
        This person wanted to park for{' '}
        <strong>{durationDescription[parking_duration]}</strong> on{' '}
        <strong>{formattedParkingTime}</strong>
      </p>
      <p>
        <strong>Comments: </strong>
        {comments ? comments : <em>none</em>}
      </p>
      <div className={styles.popupFooter}>
        <Link
          className={styles.sidebarButton}
          to={`/dashboard?view_all=1&submission_id=${id}`}
          data-umami-event="issue-map_open_in_sidebar"
          data-umami-event-id={id}
        >
          Focus in Sidebar
        </Link>
        <span className={styles.submissionId}>ID: {id}</span>
      </div>
    </Popup>
  );
}

const durationDescription = {
  minutes: 'less than an hour',
  hours: 'several hours',
  overnight: 'overnight',
  multiday: 'several days',
};

const popupIssueLabels = {
  not_provided: 'Bicycle parking was full',
  damaged: 'Bicycle parking was damaged',
  abandoned: 'Parked bicycle was abandoned',
  other: 'Other issue',
  full: 'Bicycle parking was full',
};
