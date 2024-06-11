import React, {useContext, useEffect, useRef} from 'react';
import {Marker, useMap} from 'react-leaflet';
import {Icon, LatLngTuple} from 'leaflet';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import {IssueType, SubmissionApiPayload} from '@/interfaces/Submission';

import {FocusedSubmissionIdContext} from '../context';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);

  const position: LatLngTuple = [submission.latitude, submission.longitude];

  const map = useMap();

  const {focus} = useContext(FocusedSubmissionIdContext)!;

  useEffect(() => {
    if (focus !== submission.id) return;

    map.flyTo(position, 18, {duration: 0.5});
    // TODO: FIX THIS BUG
    markerRef.current?.openPopup();
  }, [focus, markerRef.current]);

  const priorityIssue = submission.issues.reduce((a: IssueType | null, c) => {
    if (a === null) return c;

    return issuePriority[a] < issuePriority[c] ? a : c;
  }, null);
  const customMarker = markerIssueIcons[priorityIssue ?? 'other'];

  return (
    <Marker
      key={submission.id}
      position={position}
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
      ref={markerRef}
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
