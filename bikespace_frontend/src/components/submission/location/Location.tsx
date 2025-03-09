import {useEffect, useRef, RefObject} from 'react';
import MapGL, {Marker, GeolocateControl} from 'react-map-gl/maplibre';

import {useSubmissionFormContext} from '../submission-form/schema';

import {FormSectionHeader} from '../form-section-header';

import 'maplibre-gl/dist/maplibre-gl.css';

import styles from './location.module.scss';

export function Location() {
  const geoControlRef =
    useRef<maplibregl.GeolocateControl>() as RefObject<maplibregl.GeolocateControl>;

  const {setValue, watch} = useSubmissionFormContext();

  const {latitude, longitude} = watch('location');

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(position => {
      setValue('location', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    });
  }, []);

  return (
    <div className={styles.location}>
      <FormSectionHeader
        title="Where was the problem?"
        description="Pin the location"
        name="location"
      />
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
            setValue('location', {
              latitude: e.lngLat.lat,
              longitude: e.lngLat.lng,
            });
          }}
        >
          <GeolocateControl
            ref={geoControlRef}
            position="top-left"
            onGeolocate={e => {
              setValue('location', {
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
