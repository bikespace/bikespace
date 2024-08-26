import React from 'react';

import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import {SubmissionApiPayload} from '@/interfaces/Submission';

import styles from './glmap.module.scss';

export interface MapProps {
  submissions: SubmissionApiPayload[];
}

function GLMap({submissions}: MapProps) {
  return (
    <Map
      initialViewState={{
        longitude: -79.376221,
        latitude: 43.733399,
        zoom: 10,
      }}
      mapStyle="https://api.maptiler.com/maps/streets/style.json?key=v29NffFdvlIBsBR5bmoQ"
      className={styles.glmap}
    />
  )
}

export default GLMap;
export {GLMap};
