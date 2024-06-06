import React from 'react';
import {Marker} from 'react-leaflet';
import {Icon} from 'leaflet';

import {IssueType, SubmissionApiPayload} from '@/interfaces/Submission';

import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import notProvidedIcon from '@/assets/icons/icon_not_provided.svg';
import abandonedIcon from '@/assets/icons/icon_abandoned.svg';
import fullIcon from '@/assets/icons/icon_full.svg';
import damagedIcon from '@/assets/icons/icon_damaged.svg';
import otherIcon from '@/assets/icons/icon_other.svg';

interface MapMarkerProps {
  submission: SubmissionApiPayload;
}

export function MapMarker({submission}: MapMarkerProps) {
  const markerIssue = submission.issues.reduce((a: IssueType | null, c) => {
    if (a === null) return c;

    return markerIssueAttrs[a].renderPriority <
      markerIssueAttrs[c]?.renderPriority
      ? a
      : c;
  }, null);
  const customMarker = markerIssueAttrs[markerIssue ?? 'other'];

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
          iconUrl: customMarker.icon,
        })
      }
    />
  );
}

// for "renderPriority", 0 is the highest priority and higher numbers are lower priority
const markerIssueAttrs = {
  not_provided: {
    id: 'not_provided',
    icon: notProvidedIcon,
    renderPriority: 0,
    labelShort: 'No nearby parking',
    labelLong: 'Bicycle parking was not provided nearby',
  },
  damaged: {
    id: 'damaged',
    icon: damagedIcon,
    renderPriority: 1,
    labelShort: 'Parking damaged',
    labelLong: 'Bicycle parking was damaged',
  },
  abandoned: {
    id: 'abandoned',
    icon: abandonedIcon,
    renderPriority: 2,
    labelShort: 'Abandoned bicycle',
    labelLong: 'Parked bicycle was abandoned',
  },
  other: {
    id: 'other',
    icon: otherIcon,
    renderPriority: 3,
    labelShort: 'Other issue',
    labelLong: 'Other issue',
  },
  full: {
    id: 'full',
    icon: fullIcon,
    renderPriority: 4,
    labelShort: 'Parking full',
    labelLong: 'Bicycle parking was full',
  },
};
