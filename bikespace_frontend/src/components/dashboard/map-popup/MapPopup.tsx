import React from 'react';
import {Popup} from 'react-leaflet';
import {SubmissionApiPayload} from '@/interfaces/Submission';
import {Link} from 'gatsby';

import {issuePriority} from '@/utils/api-data-attributes';

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
                popupIssueAttrs[issue] ? (
                  <div
                    className={`${styles.issue} ${styles[issue]}`}
                    key={issue}
                  >
                    {popupIssueAttrs[issue].labelLong}
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

const popupIssueAttrs = {
  not_provided: {
    labelShort: 'No nearby parking',
    labelLong: 'Bicycle parking was not provided nearby',
  },
  damaged: {
    labelShort: 'Parking damaged',
    labelLong: 'Bicycle parking was damaged',
  },
  abandoned: {
    labelShort: 'Abandoned bicycle',
    labelLong: 'Parked bicycle was abandoned',
  },
  other: {
    labelShort: 'Other issue',
    labelLong: 'Other issue',
  },
  full: {
    labelShort: 'Parking full',
    labelLong: 'Bicycle parking was full',
  },
};
