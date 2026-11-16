import React, {useMemo, useRef, forwardRef, useImperativeHandle} from 'react';
import {Marker} from 'react-leaflet';
import {
  Popup as LeafletPopup,
  Marker as LeafletMarker,
  Icon,
  LatLngTuple,
} from 'leaflet';

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
  isSelected: boolean;
  onClick: () => void;
}

const MapMarker = forwardRef(
  (
    {submission, isSelected, onClick}: MapMarkerProps,
    outerMarkerRef: React.ForwardedRef<LeafletMarker>
  ) => {
    // popupRef for calling openPopup() upon focus change
    // `Popup` from 'react-leaflet' forwards `Popup` from 'leaflet'
    const popupRef = useRef<LeafletPopup>(null);
    const innerMarkerRef = useRef<LeafletMarker>(null);
    // pass MarkerRef to parent while also allowing it to be used in this component:
    useImperativeHandle(outerMarkerRef, () => innerMarkerRef.current!, []);

    // `position` and `icon` are memoized because react-leaflet compares them by
    // reference on every render. A new array calls marker.setLatLng(), which
    // markercluster handles by removing and re-adding the marker; that
    // collapses a spiderfied cluster (e.g. right after zoomToShowLayer).
    const {latitude, longitude} = submission;
    const position: LatLngTuple = useMemo(
      () => [latitude, longitude],
      [latitude, longitude]
    );

    const trackPopupOpen = () => {
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

    const icon = useMemo(() => {
      const baseIconHeight = 36;
      const iconHeight = isSelected ? baseIconHeight * 1.5 : baseIconHeight;
      const iconWidth = iconHeight;
      return new Icon({
        shadowUrl: markerShadow.src,
        iconSize: [iconWidth, iconHeight],
        iconAnchor: [iconWidth / 2, iconHeight],
        popupAnchor: [0, -(iconHeight * 0.8)],
        shadowSize: [iconWidth, iconHeight],
        shadowAnchor: [iconWidth / 3, iconHeight],
        iconUrl: customMarker,
        className: styles.marker,
      });
    }, [isSelected, customMarker]);

    return (
      <Marker
        position={position}
        icon={icon}
        eventHandlers={{
          click: onClick,
          popupopen: trackPopupOpen,
        }}
        ref={innerMarkerRef}
        alt={`Marker for submission ${submission.id}`}
      >
        <MapPopup submission={submission} ref={popupRef} />
      </Marker>
    );
  }
);

const markerIssueIcons = {
  [IssueType.NotProvided]: notProvidedIcon.src,
  [IssueType.Damaged]: damagedIcon.src,
  [IssueType.Abandoned]: abandonedIcon.src,
  [IssueType.Other]: otherIcon.src,
  [IssueType.Full]: fullIcon.src,
};

export {MapMarker};
