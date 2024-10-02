import React, {forwardRef} from 'react';
import {Popup} from 'react-leaflet';
import {Popup as LeafletPopup} from 'leaflet';
import {SubmissionApiPayload} from '@/interfaces/Submission';

import {issuePriority} from '@/config/bikespace-api';

import {useSubmissionsStore} from '@/states/store';

import {SidebarTab, useSidebarTab, useSubmissionId} from '@/states/url-params';
import {IssueBadge} from '../issue-badge';

import styles from './map-popup.module.scss';

interface MapPopupProps {
  submission: SubmissionApiPayload;
}

export const MapPopup = forwardRef<LeafletPopup, MapPopupProps>(
  ({submission}: MapPopupProps, ref) => {
    const [, setSubmissionId] = useSubmissionId();
    const [, setTab] = useSidebarTab();

    const {issues, id, comments, parking_duration, parking_time} = submission;

    const formattedParkingTime = new Date(
      parking_time + '+00:00'
    ).toLocaleString('en-CA', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

    return (
      <Popup ref={ref} className={styles.popup}>
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
              setSubmissionId(id);
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
);

const durationDescription = {
  minutes: 'less than an hour',
  hours: 'several hours',
  overnight: 'overnight',
  multiday: 'several days',
};
