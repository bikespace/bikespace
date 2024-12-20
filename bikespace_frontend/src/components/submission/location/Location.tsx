import React from 'react';
import {LocationLatLng} from '@/interfaces/Submission';
import {MapContainer, TileLayer, Marker} from 'react-leaflet';
import {LatLngTuple} from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

import styles from './location.module.scss';

export interface LocationProps {
  location: LocationLatLng;
  handler: React.ReactNode;
}

function Location({location, handler}: LocationProps) {
  const position = [location.latitude, location.longitude] as LatLngTuple;

  return (
    <div className={styles.location}>
      <h2>Where was the problem?</h2>
      <h3>Pin the location</h3>

      <section className={styles.outerMapContainer} role="application">
        <MapContainer
          center={position}
          zoom={18}
          scrollWheelZoom={false}
          style={{height: '100%'}}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <Marker position={position} />
          {handler}
        </MapContainer>
      </section>
    </div>
  );
}

export {Location};
export default Location;
