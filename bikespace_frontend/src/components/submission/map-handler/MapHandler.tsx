import React, {useEffect} from 'react';
import {useMapEvent, useMap} from 'react-leaflet';

import {useSubmissionFormContext} from '../schema';

export const MapHandler = () => {
  const {setValue} = useSubmissionFormContext();

  const map = useMap();

  useEffect(() => {
    map.locate().on('locationfound', e => {
      map.flyTo(e.latlng);
      map.stopLocate();
    });
  }, []);

  useMapEvent('click', e => {
    setValue('location', {
      latitude: e.latlng.lat,
      longitude: e.latlng.lng,
    });
  });

  useMapEvent('locationfound', e => {
    setValue('location', {
      latitude: e.latlng.lat,
      longitude: e.latlng.lng,
    });
  });

  return <div hidden aria-hidden />;
};
