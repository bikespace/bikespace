import React, {useEffect, useRef} from 'react';
import {Route} from 'next';
import {usePathname, useSearchParams, useRouter} from 'next/navigation';
import {Marker, useMap} from 'react-leaflet';
import {Popup as LeafletPopup} from 'leaflet';
import {Icon, LatLngTuple} from 'leaflet';

import {IssueType, SubmissionApiPayload} from '@/interfaces/Submission';

import {issuePriority} from '@/config/bikespace-api';

import {trackUmamiEvent} from '@/utils';
import {flyToMarker, openMarkerPopup} from './utils';

import {SidebarTab, useSubmissionId} from '@/states/url-params';

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
  windowWidth: number | null;
}

const FLYTO_ANIMATION_DURATION = 0.5; // 0.5 seconds
const FLYTO_ZOOM_MOBILE = 20;
const FLYTO_ZOOM_DESKTOP = 18;
const OPENPOPUP_DELAY = FLYTO_ANIMATION_DURATION * 2 * 1000; // in milliseconds

export function MapMarker({submission, windowWidth}: MapMarkerProps) {
  // popupRef for calling openPopup() upon focus change
  // `Popup` from 'react-leaflet' forwards `Popup` from 'leaflet'
  const popupRef = useRef<LeafletPopup>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const {replace} = useRouter();

  const position: LatLngTuple = [submission.latitude, submission.longitude];

  const map = useMap();

  const [focus, setFocus] = useSubmissionId();

  const isFocused = focus === submission.id;

  useEffect(() => {
    if (!isFocused || (windowWidth && windowWidth <= 768)) return;

    flyToMarker(map, position, {
      zoom: FLYTO_ZOOM_DESKTOP,
      duration: FLYTO_ANIMATION_DURATION,
    });

    openMarkerPopup(map, popupRef, {duration: OPENPOPUP_DELAY});
  }, []);

  useEffect(() => {
    if (!isFocused || (windowWidth && windowWidth > 768)) return;

    flyToMarker(map, position, {
      zoom: FLYTO_ZOOM_MOBILE,
      duration: FLYTO_ANIMATION_DURATION,
    });

    openMarkerPopup(map, popupRef, {duration: OPENPOPUP_DELAY});
  }, [isFocused, popupRef.current]);

  const handlePopupClose = () => {
    if (focus === submission.id) setFocus(null);
  };

  const handlePopupOpen = () => {
    trackUmamiEvent('popupopen', {
      submission_id: submission.id,
    });
  };

  const handleClick = () => {
    if (windowWidth && windowWidth <= 768) {
      // Manually set tab= URL params to prevent excess rerendering from subscribing to tab change
      const params = new URLSearchParams(searchParams);

      params.set('tab', SidebarTab.Feed);

      replace(`${pathname}?${params.toString()}` as Route);
    }

    setFocus(submission.id);
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
