import React from 'react';
import {Marker} from 'react-leaflet';
import {Icon} from 'leaflet';

import {SubmissionApiPayload} from '@/interfaces/Submission';

interface MapMarkerProps {
  submission: SubmissionApiPayload;
}

export function MapMarker({submission}: MapMarkerProps) {
  return (
    <Marker
      key={submission.id}
      position={[submission.latitude, submission.longitude]}
      icon={
        new Icon({
          shadowUrl: './libraries/leaflet/images/marker-shadow.png',
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36 * 0.8],
          shadowSize: [41, 41],
          shadowAnchor: [12, 41],
        })
      }
    />
  );
}
