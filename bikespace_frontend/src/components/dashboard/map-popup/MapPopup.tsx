import React from 'react';
import {Popup} from 'react-map-gl/maplibre';

import {SubmissionApiPayload} from '@/interfaces/Submission';

import {issuePriority} from '@/config/bikespace-api';

import {trackUmamiEvent} from '@/utils';

import {SidebarTab, useSidebarTab, useSubmissionId} from '@/states/url-params';

import {IssueBadge} from '../issue-badge';

import styles from './map-popup.module.scss';

interface MapPopupProps {
  submission: SubmissionApiPayload;
}

export function MapPopup({submission}: MapPopupProps) {
  const [focus, setFocus] = useSubmissionId();
  const [, setTab] = useSidebarTab();

  const {
    latitude,
    longitude,
    issues,
    id,
    comments,
    parking_duration,
    parking_time,
  } = submission;

  const handlePopupClose = () => {
    if (focus === id) setFocus(null);
  };

  const handlePopupOpen = () => {
    trackUmamiEvent('popupopen', {
      submission_id: submission.id,
    });
  };

  const formattedParkingTime = new Date(parking_time).toLocaleString('en-CA', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return (
    <Popup
      latitude={latitude}
      longitude={longitude}
      className={styles.popup}
      onOpen={handlePopupOpen}
      onClose={handlePopupClose}
      anchor="bottom"
    >
      <div>
        <strong>Issues:</strong>
        {issues ? (
          <div className={styles.issues}>
            {issues
              .sort((a, b) => issuePriority[a] - issuePriority[b])
              .map(issue => (
                <IssueBadge issue={issue} labelForm="long" key={issue} />
              ))}
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
        <button
          className={styles.sidebarButton}
          onClick={() => {
            setTab(SidebarTab.Feed);
            setFocus(id);
          }}
          data-umami-event="issue-map_open_in_sidebar"
          data-umami-event-id={id}
        >
          Focus in Sidebar
        </button>
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
