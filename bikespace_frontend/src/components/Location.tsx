import React from "react";
import { LocationLatLng } from "../interfaces/Submission";
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, useMapEvent } from 'react-leaflet'

function Location(props: {location: LocationLatLng, onLocationChanged: (location: LocationLatLng) => void}) {
  const handleLocationChanged = (location: LocationLatLng) => {
    props.onLocationChanged(location);
  }

  const MapHandler = () => {
    useMapEvent('click', (e) => {
      handleLocationChanged({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      })
    })
    return null;
  }

  return (
    <div id="submission-location">
      <h2>What was the issue?</h2>
      <h3>Choose at least one</h3>

      <section id="outer-map-container">
        <MapContainer
          center={[props.location.latitude, props.location.longitude]}
          zoom={18}
          scrollWheelZoom={false}
          style={{ height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={[props.location.latitude, props.location.longitude]}
          />
          <MapHandler />
        </MapContainer>
      </section>
    </div>
  );
}

export default Location;
