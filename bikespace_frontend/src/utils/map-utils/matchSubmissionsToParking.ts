import {distance} from '@turf/distance';
import {point} from '@turf/helpers';

import type {Feature, GeoJsonProperties} from 'geojson';

import {SubmissionApiPayload} from '@/interfaces/Submission';

import {getCentroid} from './mapUtils';

// mid-point of the 5-30m range identified for investigation
export const DEFAULT_MATCH_RADIUS_METERS = 15;

// grid cell size used to bucket parking features so each submission only
// needs to be checked against nearby features instead of all of them
const METERS_PER_DEGREE_LAT = 111320;

// Properties that can serve as a stable id for a parking feature, in
// priority order. Not every feature has every field - which one is present
// depends on the feature's data source - so this tries each in turn and
// uses whichever the feature actually has.

const ID_PROPERTIES = [
  'meta_osm_id',
  'ref:open.toronto.ca:bicycle-parking-high-capacity-outdoor:id',
  'ref:open.toronto.ca:bicycle-parking-racks:objectid',
  'ref:open.toronto.ca:street-furniture-bicycle-parking:id',
  'ref:open.toronto.ca:bicycle-parking-bike-stations-indoor:id',
  'ref:toronto.ca:lockers:title',
];

// Identifies a parking feature for matching purposes. Prefers a stable id
// from its own data source when available (two distinct-but-nearby features
// can otherwise round to the same coordinate key and have their reports
// incorrectly merged. Falls back to a coordinate-rounded key only when a
// feature has none of the known id properties.
//
// The coordinate fallback is rounded to 5 decimals (~1.1m) rather than 6
// (~11cm): the same parking feature can be looked up from two different
// coordinate sources - the raw fetched GeoJSON vs. MapLibre's
// vector-tile-reconstructed geometry (when a feature is clicked on the map)
// - and tile requantization can shift a coordinate by a few centimetres,
// enough to flip a 6-decimal rounding boundary and produce two different key
// strings for the same feature. A looser 5-decimal bucket absorbs that noise
// while staying far tighter than the match radius.
function parkingFeatureKey(
  properties: GeoJsonProperties,
  lon: number,
  lat: number
): string {
  for (const idProperty of ID_PROPERTIES) {
    const value = properties?.[idProperty];
    if (value) return `id:${idProperty}:${value}`;
  }
  return `coord:${lon.toFixed(5)},${lat.toFixed(5)}`;
}

function gridCellKey(lon: number, lat: number, cellSizeDeg: number): string {
  const col = Math.floor(lon / cellSizeDeg);
  const row = Math.floor(lat / cellSizeDeg);
  return `${col},${row}`;
}

/**
 * Groups submissions by the nearby parking feature they are most likely
 * reporting on, matching by proximity (there is no direct database
 * relationship between submissions and parking features).
 *
 * Matching is done via a distance check (equivalent to buffering each
 * submission and checking which parking features fall inside), sped up with
 * a grid bucket index so submissions are only compared against nearby
 * parking features rather than the full dataset.
 *
 * @returns a Map from parking feature key (see parkingFeatureKey) to the
 * list of submissions matched to that feature
 */
export function matchSubmissionsToParking(
  submissions: SubmissionApiPayload[],
  parkingFeatures: Feature[],
  radiusMeters: number = DEFAULT_MATCH_RADIUS_METERS
): Map<string, SubmissionApiPayload[]> {
  const cellSizeDeg = radiusMeters / METERS_PER_DEGREE_LAT;

  const grid = new Map<string, {key: string; lon: number; lat: number}[]>();
  for (const feature of parkingFeatures) {
    const [lon, lat] = getCentroid(feature);
    const cellKey = gridCellKey(lon, lat, cellSizeDeg);
    const cell = grid.get(cellKey) ?? [];
    cell.push({key: parkingFeatureKey(feature.properties, lon, lat), lon, lat});
    grid.set(cellKey, cell);
  }

  const matches = new Map<string, SubmissionApiPayload[]>();

  for (const submission of submissions) {
    const {longitude: subLon, latitude: subLat} = submission;
    const submissionPoint = point([subLon, subLat]);
    const col = Math.floor(subLon / cellSizeDeg);
    const row = Math.floor(subLat / cellSizeDeg);

    for (let dCol = -1; dCol <= 1; dCol++) {
      for (let dRow = -1; dRow <= 1; dRow++) {
        const candidates = grid.get(`${col + dCol},${row + dRow}`);
        if (!candidates) continue;

        for (const candidate of candidates) {
          const distanceMeters = distance(
            submissionPoint,
            point([candidate.lon, candidate.lat]),
            {
              units: 'meters',
            }
          );
          if (distanceMeters <= radiusMeters) {
            const matched = matches.get(candidate.key) ?? [];
            matched.push(submission);
            matches.set(candidate.key, matched);
          }
        }
      }
    }
  }

  return matches;
}

export {parkingFeatureKey};
