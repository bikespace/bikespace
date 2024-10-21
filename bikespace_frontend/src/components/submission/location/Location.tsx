import React, {useEffect} from 'react';
import {MapContainer, TileLayer, Marker} from 'react-leaflet';
import {LatLngTuple} from 'leaflet';

import {useSubmissionFormContext} from '../schema';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

import {FormSectionHeader} from '../form-section-header';

import styles from './location.module.scss';

export interface LocationProps {
  handler: React.ReactNode;
}

function Location({handler}: LocationProps) {
  const {setValue, watch} = useSubmissionFormContext();

  const location = watch('location');

  const position = [location.latitude, location.longitude] as LatLngTuple;

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
