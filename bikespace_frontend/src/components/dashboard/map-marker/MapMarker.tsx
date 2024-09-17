import React from 'react';
import {Route} from 'next';
import {usePathname, useSearchParams, useRouter} from 'next/navigation';
import {Marker} from 'react-map-gl/maplibre';

import {IssueType, SubmissionApiPayload} from '@/interfaces/Submission';

import {issuePriority} from '@/config/bikespace-api';

import {SidebarTab, useSubmissionId} from '@/states/url-params';

import {MapPopup} from '../map-popup';

import notProvidedIcon from '@/assets/icons/icon_not_provided.svg';
import abandonedIcon from '@/assets/icons/icon_abandoned.svg';
import fullIcon from '@/assets/icons/icon_full.svg';
import damagedIcon from '@/assets/icons/icon_damaged.svg';
import otherIcon from '@/assets/icons/icon_other.svg';

import styles from './map-marker.module.scss';

interface MapMarkerProps {
  submission: SubmissionApiPayload;
  windowWidth: number | null;
}

export function MapMarker({submission, windowWidth}: MapMarkerProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const {replace} = useRouter();

  const [focus, setFocus] = useSubmissionId();

  const isFocused = focus === submission.id;

  const priorityIssue = submission.issues.reduce((a: IssueType | null, c) => {
    if (a === null) return c;

    return issuePriority[a] < issuePriority[c] ? a : c;
  }, null);
  const customMarkerSrc = markerIssueIcons[priorityIssue ?? IssueType.Other];

  return (
    <Marker
      latitude={submission.latitude}
      longitude={submission.longitude}
      onClick={e => {
        e.originalEvent.stopPropagation();

        const params = new URLSearchParams(searchParams);

        params.set('tab', SidebarTab.Feed);

        replace(`${pathname}?${params.toString()}` as Route);
        setFocus(submission.id);
      }}
      className={`${styles.marker}${isFocused ? ` ${styles.focused}` : ''}`}
      anchor="bottom"
      offset={[0, 40]}
    >
      <img src={customMarkerSrc} />
      {isFocused && windowWidth && windowWidth >= 768 && (
        <MapPopup submission={submission} />
      )}
    </Marker>
  );
}

const markerIssueIcons = {
  [IssueType.NotProvided]: notProvidedIcon.src,
  [IssueType.Damaged]: damagedIcon.src,
  [IssueType.Abandoned]: abandonedIcon.src,
  [IssueType.Other]: otherIcon.src,
  [IssueType.Full]: fullIcon.src,
};
