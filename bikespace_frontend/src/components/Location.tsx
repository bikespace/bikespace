import React, { useState } from "react";
import Submission, { SubmissionComponentProps } from "../interfaces/Submission";
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, useMapEvent } from 'react-leaflet'

function Location(props: SubmissionComponentProps) {
  const changeMarkLocation = (latitude: number, longitude: number) => {
    let newSubmission: Submission;
    newSubmission = {
      ...props.submission,
      latitude,
      longitude,
    };
    props.onSubmissionChanged(newSubmission);
  };

  function MapHandler(props: {changeMarkLocation: (latitude: number, longitude: number) => void}) {
    useMapEvent('click', (e) => {
      props.changeMarkLocation(e.latlng.lat, e.latlng.lng)
    })
    return null;
  }

  return (
    <div id="submission-location">
      <h2>What was the issue?</h2>
      <h3>Choose at least one</h3>

      <section id="outer-map-container">
        <MapContainer
          center={[props.submission.latitude, props.submission.longitude]}
          zoom={18}
          scrollWheelZoom={false}
          style={{ height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={[props.submission.latitude, props.submission.longitude]}
          />
          <MapHandler changeMarkLocation={changeMarkLocation} />
        </MapContainer>
      </section>
    </div>
  );
}

export default Location;
