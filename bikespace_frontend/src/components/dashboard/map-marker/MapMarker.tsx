import React, {useEffect, useRef} from 'react';
import {Marker, useMap} from 'react-leaflet';
import {Popup as LeafletPopup} from 'leaflet';
import {Icon, LatLngTuple} from 'leaflet';

import {IssueType, SubmissionApiPayload} from '@/interfaces/Submission';

import {issuePriority} from '@/config/bikespace-api';

import {trackUmamiEvent} from '@/utils';

import {MapPopup} from '../map-popup';

import notProvidedIcon from '@/assets/icons/icon_not_provided.svg';
import abandonedIcon from '@/assets/icons/icon_abandoned.svg';
import fullIcon from '@/assets/icons/icon_full.svg';
import damagedIcon from '@/assets/icons/icon_damaged.svg';
import otherIcon from '@/assets/icons/icon_other.svg';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import styles from './map-marker.module.scss';

interface MapMarkerProps {
  submission: SubmissionApiPayload;
  isFocused: boolean;
  handleClick: () => void;
  handlePopupClose: () => void;
}

export function MapMarker({
  submission,
  isFocused,
  handleClick,
  handlePopupClose,
}: MapMarkerProps) {
  // popupRef for calling openPopup() upon focus change
  // `Popup` from 'react-leaflet' forwards `Popup` from 'leaflet'
  const popupRef = useRef<LeafletPopup>(null);

  const position: LatLngTuple = [submission.latitude, submission.longitude];

  const map = useMap();

  useEffect(() => {
    if (!isFocused) return;

    const duration = 0.5;

    map.flyTo(position, 18, {duration});

    // put openPopup to the end of the event loop job queue so openPopup()
    // is queued after all the calls flyTo() triggers
    // i.e. this minimize the chance of popup from opening during the flyTo() changes
    // also map.openPopup() works most of the time while marker.openPopup() does not
    setTimeout(() => {
      if (!popupRef.current) return;

      map.openPopup(popupRef.current);

      trackUmamiEvent('popupopen', {
        submission_id: submission.id,
      });
    }, duration * 1000);
  }, [isFocused, popupRef.current]);

  const priorityIssue = submission.issues.reduce((a: IssueType | null, c) => {
    if (a === null) return c;

    return issuePriority[a] < issuePriority[c] ? a : c;
  }, null);
  const customMarker = markerIssueIcons[priorityIssue ?? IssueType.Other];

  return (
    <Marker
      key={submission.id}
      position={position}
      icon={
        new Icon({
          shadowUrl: markerShadow.src,
          iconSize: isFocused ? [54, 54] : [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36 * 0.8],
          shadowSize: [41, 41],
          shadowAnchor: [12, 41],
          iconUrl: customMarker,
          className: styles.marker,
        })
      }
      eventHandlers={{
        click: handleClick,
        popupclose: handlePopupClose,
      }}
    >
      <MapPopup submission={submission} ref={popupRef} />
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
