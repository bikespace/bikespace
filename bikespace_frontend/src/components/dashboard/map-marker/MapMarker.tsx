import React from 'react';
import {Marker} from 'react-leaflet';
import {Icon} from 'leaflet';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import {IssueType, SubmissionApiPayload} from '@/interfaces/Submission';

import {issuePriority} from '@/config/bikespace-api';

import {MapPopup} from '../map-popup';

import notProvidedIcon from '@/assets/icons/icon_not_provided.svg';
import abandonedIcon from '@/assets/icons/icon_abandoned.svg';
import fullIcon from '@/assets/icons/icon_full.svg';
import damagedIcon from '@/assets/icons/icon_damaged.svg';
import otherIcon from '@/assets/icons/icon_other.svg';

interface MapMarkerProps {
  submission: SubmissionApiPayload;
}

export function MapMarker({submission}: MapMarkerProps) {
  const priorityIssue = submission.issues.reduce((a: IssueType | null, c) => {
    if (a === null) return c;

    return issuePriority[a] < issuePriority[c] ? a : c;
  }, null);
  const customMarker = markerIssueIcons[priorityIssue ?? 'other'];

  return (
    <Marker
      key={submission.id}
      position={[submission.latitude, submission.longitude]}
      icon={
        new Icon({
          shadowUrl: markerShadow,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36 * 0.8],
          shadowSize: [41, 41],
          shadowAnchor: [12, 41],
          iconUrl: customMarker,
        })
      }
    >
      <MapPopup submission={submission} />
    </Marker>
  );
}

// for "renderPriority", 0 is the highest priority and higher numbers are lower priority
const markerIssueIcons = {
  not_provided: notProvidedIcon,
  damaged: damagedIcon,
  abandoned: abandonedIcon,
  other: otherIcon,
  full: fullIcon,
};
