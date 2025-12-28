import React, {useEffect, useRef, MutableRefObject} from 'react';

import {Marker} from 'react-leaflet';
import {
  Marker as LeafletMarker,
  Icon,
  LatLngTuple,
  MarkerClusterGroup as LeafletMarkerClusterGroup,
} from 'leaflet';

import {useStore} from '@/states/store';
import {SidebarTab, useSidebarTab, useSubmissionId} from '@/states/url-params';
import {useSubmissionsQuery} from '@/hooks';

import {IssueType, SubmissionApiPayload} from '@/interfaces/Submission';
import {issuePriority} from '@/config/bikespace-api';
import {trackUmamiEvent} from '@/utils';

import {MapPopup} from '../map-popup';

import styles from './map-marker.module.scss';
import {wrapperFullWidth} from '@/styles/variablesTS';

import notProvidedIcon from '@/assets/icons/icon_not_provided.svg';
import abandonedIcon from '@/assets/icons/icon_abandoned.svg';
import fullIcon from '@/assets/icons/icon_full.svg';
import damagedIcon from '@/assets/icons/icon_damaged.svg';
import otherIcon from '@/assets/icons/icon_other.svg';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

interface MapMarkerProps {
  submission: SubmissionApiPayload;
  doneLoading: boolean;
  clusterRef: MutableRefObject<LeafletMarkerClusterGroup | null>;
}

function MapMarker({submission, doneLoading, clusterRef}: MapMarkerProps) {
  const markerRef = useRef<LeafletMarker>(null);

  const {dataUpdatedAt} = useSubmissionsQuery();
  const [, setTab] = useSidebarTab();
  const {setIsOpen} = useStore(state => ({
    setIsOpen: state.ui.sidebar.setIsOpen,
  }));
  const [focus, setFocus] = useSubmissionId();
  const isFocused = focus === submission.id;

  const position: LatLngTuple = [submission.latitude, submission.longitude];
  const baseIconHeight = 36;
  const iconHeight = isFocused ? baseIconHeight * 1.5 : baseIconHeight;
  const iconWidth = iconHeight;

  // focus pin if selected
  // re-focus if full submissions query changes
  // check for selected pin when layer finishes loading
  useEffect(() => {
    if (!isFocused || !doneLoading) return;
    setTimeout(() => {
      clusterRef.current!.zoomToShowLayer(markerRef.current!, () => {
        markerRef.current!.openPopup();
      });
    }, 0);
  }, [isFocused, dataUpdatedAt, doneLoading]);

  const handlePopupClose = () => {
    if (focus === submission.id) setFocus(null);
  };

  const handlePopupOpen = () => {
    trackUmamiEvent('popupopen', {
      submission_id: submission.id,
    });
  };

  // handle marker click on mobile
  const handleClick = () => {
    if (window.innerWidth <= wrapperFullWidth) {
      setFocus(submission.id);
      setTab(SidebarTab.Feed);
      setIsOpen(true);
    }
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
        click: handleClick,
        popupclose: handlePopupClose,
        popupopen: handlePopupOpen,
      }}
      ref={markerRef}
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
