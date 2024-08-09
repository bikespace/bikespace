import React from 'react';
import {useMapEvent} from 'react-leaflet';

import {LocationLatLng} from '@/interfaces/Submission';

interface MapHandlerProps {
  onLocationChanged: (location: LocationLatLng) => void;
}

export const MapHandler = ({onLocationChanged}: MapHandlerProps) => {
  useMapEvent('click', e => {
    onLocationChanged({
      latitude: e.latlng.lat,
      longitude: e.latlng.lng,
    });
  });

  return <div hidden aria-hidden />;
};
