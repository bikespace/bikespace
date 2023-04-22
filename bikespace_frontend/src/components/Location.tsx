import React, { Component } from "react";
import { SubmissionComponentProps } from "../interfaces/Submission";
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet'

class Location extends React.Component<SubmissionComponentProps> {
  calculateMapHeight() {
    return document.getElementById("outer-map-container")?.clientHeight || 0;
  }

  render(): React.ReactNode {
    return (
      <div id="submission-location">
        <h2>What was the issue?</h2>
        <h3>Choose at least one</h3>

        <section id="outer-map-container">
          <MapContainer
            center={[51.505, -0.09]}
            zoom={13}
            scrollWheelZoom={false}
            style={{height: `${this.calculateMapHeight()}px`}}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[51.505, -0.09]}>
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
          </MapContainer>
        </section>
      </div>
    );
  }
}

export default Location;
