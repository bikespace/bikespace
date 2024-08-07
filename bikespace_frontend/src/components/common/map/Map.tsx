import React, {
  ComponentProps,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {Marker} from 'react-leaflet';
import {useMap, MapContainer, TileLayer} from 'react-leaflet';
import {LatLngTuple} from 'leaflet';
import {useWindowSize} from '@uidotdev/usehooks';

import {IssueType, SubmissionApiPayload} from '@/interfaces/Submission';

import {MapMarker} from '../map-marker';
import {LeafletLocateControl} from '../leaflet-locate-control';
import {LeafletMarkerClusterGroup} from '../leaflet-marker-cluster-group';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import * as styles from './map.module.scss';
import {FocusedSubmissionIdContext} from '@/components/dashboard/context';

import notProvidedIcon from '@/assets/icons/icon_not_provided.svg';
import abandonedIcon from '@/assets/icons/icon_abandoned.svg';
import fullIcon from '@/assets/icons/icon_full.svg';
import damagedIcon from '@/assets/icons/icon_damaged.svg';
import otherIcon from '@/assets/icons/icon_other.svg';
import {issuePriority} from '@/config/bikespace-api';
import {Icon} from 'leaflet';
import {MapMarkerProps} from '../map-marker/MapMarker';
import {MapPopup} from '@/components/dashboard/map-popup';

interface MapProps {
  // submissions: SubmissionApiPayload[];
  markers: MapMarkerProps[];
  className?: string;
}

const tileLayers = {
  osm: (
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
      url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
  ),
  thunderforest: (
    <TileLayer
      attribution='&copy; Maps <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; Data <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
      url="https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=66ccf6226ef54ef38a6b97fe0b0e5d2e"
    />
  ),
};

interface SubmissionMapProps {
  submissions: SubmissionApiPayload[];
}

const markerIssueIcons = {
  not_provided: notProvidedIcon,
  damaged: damagedIcon,
  abandoned: abandonedIcon,
  other: otherIcon,
  full: fullIcon,
};

const getIcon = (submission: SubmissionApiPayload) => {
  const priorityIssue = submission.issues.reduce((a: IssueType | null, c) => {
    if (a === null) return c;

    return issuePriority[a] < issuePriority[c] ? a : c;
  }, null);
  return markerIssueIcons[priorityIssue ?? 'other'];
};

export function SubmissionsMap({submissions}: SubmissionMapProps) {
  const {focus} = useContext(FocusedSubmissionIdContext)!;

  const markers: MapMarkerProps[] = useMemo(() => {
    return submissions.map(submission => {
      return {
        id: submission.id.toFixed(0),
        position: [submission.latitude, submission.longitude],
        focused: focus === submission.id,
        icon: new Icon({
          shadowUrl: markerShadow,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36 * 0.8],
          shadowSize: [41, 41],
          shadowAnchor: [12, 41],
          iconUrl: getIcon(submission),
        }),
        children: <MapPopup submission={submission} />,
      };
    });
  }, [submissions, focus]);
  return <Map markers={markers} />;
}

export function Map({className, markers}: MapProps) {
  const mapRef = useRef(null);

  return (
    <div className={`${styles.map} ${className}`}>
      <MapContainer
        center={[43.733399, -79.376221]}
        zoom={11}
        scrollWheelZoom
        style={{height: '100%'}}
        ref={mapRef}
      >
        <LeafletLocateControl />
        {tileLayers.thunderforest}
        <MapHandler />
        <LeafletMarkerClusterGroup chunkedLoading>
          {markers.map(marker => (
            <MapMarker key={marker.id} {...marker} />
          ))}
        </LeafletMarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

const MapHandler = () => {
  const map = useMap();

  const window = useWindowSize();

  useEffect(() => {
    map
      .locate()
      .on('locationfound', e => {
        // this.analytics_event('locationfound');
        map.flyTo(e.latlng, map.getZoom());
      })
      .on('locationerror', err => {
        const code = err.code as 0 | 1 | 2 | 3;

        const message =
          CUSTOM_GEO_ERROR_MESSAGES[code] ||
          'Unknown error while trying to locate you';
        // this.analytics_event('locationerror', {code: err.code, message});
        console.log(message);
      });
  }, []);

  useEffect(() => {
    map.invalidateSize();
  }, [window]);

  return null;
};

const CUSTOM_GEO_ERROR_MESSAGES = {
  // leaflet internally uses 0 to denote missing Geolocation API
  // ref: https://github.com/Leaflet/Leaflet/blob/00e0534cd9aa723d10a652146311efd9ce990b46/src/map/Map.js#L632
  0: 'GPS is not supported in your browser.',
  1: 'Please allow location access.',
  // happens when: location is disabled at OS-level / when GPS has other errors
  2: 'Had trouble locating you. Please turn on / restart your GPS or try another device.',
  3: 'It took too long to locate you. Please try again.',
};
