import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  MutableRefObject,
} from 'react';
import {Route} from 'next';
import {usePathname, useSearchParams, useRouter} from 'next/navigation';
import {Marker, useMap} from 'react-leaflet';
import {
  Popup as LeafletPopup,
  Marker as LeafletMarker,
  Icon,
  LatLngTuple,
  MarkerClusterGroup as LeafletMarkerClusterGroup,
} from 'leaflet';

import {IssueType, SubmissionApiPayload} from '@/interfaces/Submission';

import {issuePriority} from '@/config/bikespace-api';

import {trackUmamiEvent} from '@/utils';

import {SidebarTab, useSubmissionId} from '@/states/url-params';

import {MapPopup} from '../map-popup';

import notProvidedIcon from '@/assets/icons/icon_not_provided.svg';
import abandonedIcon from '@/assets/icons/icon_abandoned.svg';
import fullIcon from '@/assets/icons/icon_full.svg';
import damagedIcon from '@/assets/icons/icon_damaged.svg';
import otherIcon from '@/assets/icons/icon_other.svg';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import styles from './map-marker.module.scss';
import {wrapperFullWidth} from '@/styles/variablesTS';

interface MapMarkerProps {
  submission: SubmissionApiPayload;
  windowWidth: number | null;
  doneLoading: boolean;
  clusterRef: MutableRefObject<LeafletMarkerClusterGroup | null>;
}

const MapMarker = forwardRef(
  (
    {submission, windowWidth, doneLoading, clusterRef}: MapMarkerProps,
    outerMarkerRef: React.ForwardedRef<LeafletMarker>
  ) => {
    // popupRef for calling openPopup() upon focus change
    // `Popup` from 'react-leaflet' forwards `Popup` from 'leaflet'
    const popupRef = useRef<LeafletPopup>(null);
    const innerMarkerRef = useRef<LeafletMarker>(null);
    // pass MarkerRef to parent while also allowing it to be used in this component:
    useImperativeHandle(outerMarkerRef, () => innerMarkerRef.current!, []);
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const {replace} = useRouter();

    const position: LatLngTuple = [submission.latitude, submission.longitude];

    const [focus, setFocus] = useSubmissionId();

    const isFocused = focus === submission.id;

    // focus pin on load if in URL param
    // omits dependencies array to run on every render
    useEffect(() => {
      if (!isFocused || !doneLoading) return;
      clusterRef.current!.zoomToShowLayer(innerMarkerRef.current!, () => {
        innerMarkerRef.current!.openPopup();
      });
    });

    const handlePopupClose = () => {
      if (focus === submission.id) setFocus(null);
    };

    const handlePopupOpen = () => {
      trackUmamiEvent('popupopen', {
        submission_id: submission.id,
      });
    };

    const handleClick = () => {
      if (windowWidth && windowWidth <= wrapperFullWidth) {
        // Manually set tab= URL params to prevent excess rerendering from subscribing to tab change
        const params = new URLSearchParams(searchParams);

        params.set('tab', SidebarTab.Feed);

        replace(`${pathname}?${params.toString()}` as Route);
        setFocus(submission.id);
      }
    };

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
          popupopen: handlePopupOpen,
        }}
        ref={innerMarkerRef}
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
