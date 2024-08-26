import React from 'react';

import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import {SubmissionApiPayload} from '@/interfaces/Submission';

import styles from './glmap.module.scss';

export interface MapProps {
  submissions: SubmissionApiPayload[];
}

function GLMap({submissions}: MapProps) {
  const [viewState, setViewState] = React.useState({
    longitude: -79.376221,
    latitude: 43.733399,
    zoom: 10,
  });

  return (
    <Map
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      mapStyle="https://api.maptiler.com/maps/streets/style.json?key=v29NffFdvlIBsBR5bmoQ"
      className={styles.glmap}
    />
  );
}

export default GLMap;
export {GLMap};
