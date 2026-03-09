import {SubmissionApiPayload} from '@/interfaces/Submission';
import type {GeoJSON} from 'geojson';

export function getGeoJSONFromSubmissions(
  submissions: SubmissionApiPayload[]
): GeoJSON {
  return {
    type: 'FeatureCollection',
    features: submissions.map(submission => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [submission.longitude, submission.latitude],
      },
      properties: submission,
    })),
  };
}
