import React, {useEffect, useRef, RefObject} from 'react';

import {Marker} from 'react-leaflet';
import 'leaflet.markercluster'; // add MarkerClusterGroup to leaflet namespace
import {
  Marker as LeafletMarker,
  MarkerClusterGroup as LeafletMarkerClusterGroup,
  Icon,
  LatLngTuple,
} from 'leaflet';
import {useStore} from '@/states/store';

import {IssueType, SubmissionApiPayload} from '@/interfaces/Submission';
import {issuePriority} from '@/config/bikespace-api';
import {trackUmamiEvent} from '@/utils';

import {MapPopup} from '../map-popup';

import styles from './map-marker.module.scss';

import notProvidedIcon from '@/assets/icons/icon_not_provided.svg';
import abandonedIcon from '@/assets/icons/icon_abandoned.svg';
import fullIcon from '@/assets/icons/icon_full.svg';
import damagedIcon from '@/assets/icons/icon_damaged.svg';
import otherIcon from '@/assets/icons/icon_other.svg';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

interface MapMarkerProps {
  submission: SubmissionApiPayload;
  clusterRef: RefObject<LeafletMarkerClusterGroup | null>;
  isSelected: boolean;
  onClick: () => void;
}

function MapMarker({
  submission,
  clusterRef,
  isSelected,
  onClick,
}: MapMarkerProps) {
  const markerRef = useRef<LeafletMarker>(null);

  const {submissions} = useStore(state => ({
    submissions: state.submissions,
  }));

  const position: LatLngTuple = [submission.latitude, submission.longitude];
  const baseIconHeight = 36;
  const iconHeight = isSelected ? baseIconHeight * 1.5 : baseIconHeight;
  const iconWidth = iconHeight;

  // focus pin if selected
  // re-focus if full submissions list to render changes
  useEffect(() => {
    if (!isSelected || !clusterRef) return;
    setTimeout(() => {
      clusterRef.current!.zoomToShowLayer(markerRef.current!, () => {
        markerRef.current!.openPopup();
      });
    }, 0);
  }, [isSelected, submissions.length, clusterRef]);

  const handlePopupOpen = () => {
    trackUmamiEvent('popupopen', {
      submission_id: submission.id,
    });
  };

  // Determine which issue type to use for marker rendering
  const priorityIssue = submission.issues.reduce((a: IssueType | null, c) => {
    if (a === null) return c;
    return issuePriority[a] < issuePriority[c] ? a : c;
  }, null);
  const customMarker = markerIssueIcons[priorityIssue ?? IssueType.Other];

  return (
    <Marker
      position={position}
      icon={
        new Icon({
          shadowUrl: markerShadow.src,
          iconSize: [iconWidth, iconHeight],
          iconAnchor: [iconWidth / 2, iconHeight],
          popupAnchor: [0, -(iconHeight * 0.8)],
          shadowSize: [iconWidth, iconHeight],
          shadowAnchor: [iconWidth / 3, iconHeight],
          iconUrl: customMarker,
          className: styles.marker,
        })
      }
      eventHandlers={{
        click: onClick,
        popupopen: handlePopupOpen,
      }}
      ref={markerRef}
      alt={`Marker for submission ${submission.id}`}
    >
      <MapPopup submission={submission} />
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

export {MapMarker};
