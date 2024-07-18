import React, {useContext, useEffect, useRef} from 'react';
import {Marker, useMap} from 'react-leaflet';
import {Popup as LeafletPopup} from 'leaflet';
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
  // popupRef for calling openPopup() upon focus change
  // `Popup` from 'react-leaflet' forwards `Popup` from 'leaflet'
  const popupRef = useRef<LeafletPopup>(null);

  const position: LatLngTuple = [submission.latitude, submission.longitude];

  const map = useMap();

  const {focus} = useContext(FocusedSubmissionIdContext);

  useEffect(() => {
    if (focus !== submission.id) return;

    map.flyTo(position, 18, {duration: 0.5});
    // put openPopup to the end of the event loop job queue so openPopup()
    // is queued after all the calls flyTo() triggers
    // i.e. this minimize the chance of popup from opening during the flyTo() changes
    // also map.openPopup() works most of the time while marker.openPopup() does not
    setTimeout(() => {
      if (popupRef.current !== null) {
        map.openPopup(popupRef.current);
      }
    }, 0);
  }, [focus, popupRef.current]);

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
          shadowUrl: markerShadow.src,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36 * 0.8],
          shadowSize: [41, 41],
          shadowAnchor: [12, 41],
          iconUrl: customMarker,
        })
      }
    >
      <MapPopup submission={submission} ref={popupRef} />
    </Marker>
  );
}

const markerIssueIcons = {
  not_provided: notProvidedIcon.src,
  damaged: damagedIcon.src,
  abandoned: abandonedIcon.src,
  other: otherIcon.src,
  full: fullIcon.src,
};
