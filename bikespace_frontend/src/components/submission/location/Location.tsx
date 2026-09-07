import {useEffect} from 'react';
import {MapContainer, TileLayer, Marker} from 'react-leaflet';
import {LatLngTuple} from 'leaflet';

import {useSubmissionFormContext} from '../submission-form/schema';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

import {FormSectionHeader} from '../form-section-header';

import styles from './location.module.scss';

export interface LocationProps {
  handler: React.ReactNode;
  useUrlLocation: boolean;
}

function Location({handler, useUrlLocation}: LocationProps) {
  const {setValue, watch} = useSubmissionFormContext();

  const location = watch('location');
  const position = [location.latitude, location.longitude] as LatLngTuple;
  const descText = useUrlLocation
    ? 'You selected this location in the parking map.'
    : 'Pin the location.';

  useEffect(() => {
    if (useUrlLocation) return;

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
        description={descText}
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
            attribution='&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={`https://api.maptiler.com/maps/streets-v4/256/{z}/{x}/{y}.png?key=${process.env.MAPTILER_API_KEY}`}
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
