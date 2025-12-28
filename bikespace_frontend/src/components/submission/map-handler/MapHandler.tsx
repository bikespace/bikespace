import React, {useEffect} from 'react';
import {useMapEvent, useMap} from 'react-leaflet';

import {useSubmissionFormContext} from '../submission-form/schema';

export const MapHandler = () => {
  const {setValue} = useSubmissionFormContext();

  const map = useMap();

  useEffect(() => {
    map.locate().on('locationfound', e => {
      map.flyTo(e.latlng);
      map.stopLocate();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
