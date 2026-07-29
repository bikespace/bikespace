import React, {useEffect} from 'react';
import {useMapEvent, useMap} from 'react-leaflet';

import {useSubmissionFormContext} from '../submission-form/schema';

export interface MapHandlerProps {
  useUrlLocation: boolean;
}

export function MapHandler({useUrlLocation}: MapHandlerProps) {
  const {setValue} = useSubmissionFormContext();

  const map = useMap();

  useEffect(() => {
    if (useUrlLocation) return;

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
}
