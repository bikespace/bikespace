import React from 'react';
import {useMapEvent} from 'react-leaflet';

import {LocationLatLng} from '@/interfaces/Submission';

import {useSubmissionFormContext} from '../schema';

export const MapHandler = () => {
  const {setValue} = useSubmissionFormContext();

  useMapEvent('click', e => {
    setValue('location', {
      latitude: e.latlng.lat,
      longitude: e.latlng.lng,
    });
  });

  return <div hidden aria-hidden />;
};
