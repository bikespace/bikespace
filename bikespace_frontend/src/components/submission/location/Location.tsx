import React, {RefObject, useRef} from 'react';
import MapGL, {Marker, GeolocateControl} from 'react-map-gl/maplibre';

import {LocationLatLng} from '@/interfaces/Submission';

import 'maplibre-gl/dist/maplibre-gl.css';

import styles from './location.module.scss';

export interface LocationProps {
  location: LocationLatLng;
  setLocation: React.Dispatch<React.SetStateAction<LocationLatLng>>;
}

function Location({location, setLocation}: LocationProps) {
  const geoControlRef =
    useRef<maplibregl.GeolocateControl>() as RefObject<maplibregl.GeolocateControl>;

  const {latitude, longitude} = location;

  return (
    <div className={styles.location}>
      <h2>Where was the problem?</h2>
      <h3>Pin the location</h3>

      <section className={styles.outerMapContainer} role="application">
        <MapGL
          initialViewState={{
            latitude,
            longitude,
            zoom: 18,
          }}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          attributionControl={false}
          // onLoad={() => {
          //   geoControlRef.current?.trigger();
          // }}
          onClick={e => {
            setLocation({
              latitude: e.lngLat.lat,
              longitude: e.lngLat.lng,
            });
          }}
        >
          <GeolocateControl
            ref={geoControlRef}
            position="top-left"
            onGeolocate={e => {
              setLocation({
                latitude: e.coords.latitude,
                longitude: e.coords.longitude,
              });
            }}
          />
          <Marker latitude={latitude} longitude={longitude} />
        </MapGL>
      </section>
    </div>
  );
}

export {Location};
export default Location;
