import React, {useCallback, useRef} from 'react';
import {MapContainer, TileLayer} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import {useWindowSize} from '@uidotdev/usehooks';

import useSubmissionsStore from '@/store';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

import {SubmissionApiPayload} from '@/interfaces/Submission';

import {MapMarker} from '../map-marker';
import {LeafletLocateControl} from '../leaflet-locate-control';
import {MapHandler} from '../map-handler';

import styles from './map.module.scss';
import './leaflet.scss';

export interface MapProps {
  submissions: SubmissionApiPayload[];
}

function Map({submissions}: MapProps) {
  const mapRef = useRef(null);

  const windowSize = useWindowSize();

  const {focus, setFocus} = useSubmissionsStore(state => ({
    focus: state.focusedId,
    setFocus: state.setFocusedId,
  }));

  const handlePopupClose = useCallback(
    (id: number) => {
      if (focus === id) setFocus(null);
    },
    [focus]
  );

  const handleClick = useCallback(
    (id: number) => {
      if (windowSize.width! > 768) return;

      setFocus(id);
    },
    [windowSize.width]
  );

  return (
    <MapContainer
      center={[43.733399, -79.376221]}
      zoom={11}
      scrollWheelZoom
      style={{width: '100%', height: '100%'}}
      ref={mapRef}
      className={styles.map}
    >
      <LeafletLocateControl />
      <TileLayer
        attribution='&copy; Maps <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; Data <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        url="https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=66ccf6226ef54ef38a6b97fe0b0e5d2e"
        maxZoom={20}
      />
      <MarkerClusterGroup chunkedLoading>
        {submissions.map(submission => (
          <MapMarker
            key={submission.id}
            submission={submission}
            isFocused={focus === submission.id}
            handleClick={() => {
              handleClick(submission.id);
            }}
            handlePopupClose={() => {
              handlePopupClose(submission.id);
            }}
          />
        ))}
      </MarkerClusterGroup>
      <MapHandler />
    </MapContainer>
  );
}

export default Map;
export {Map};
