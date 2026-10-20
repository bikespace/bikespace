import {
  matchSubmissionsToParking,
  parkingFeatureKey,
} from './matchSubmissionsToParking';

import type {Feature} from 'geojson';
import {
  IssueType,
  ParkingDuration,
  SubmissionApiPayload,
} from '@/interfaces/Submission';

// Toronto City Hall, used as an arbitrary base coordinate for test fixtures
const baseLon = -79.384452;
const baseLat = 43.65322;
// ~1 degree of latitude is ~111,320m; used to build small, known offsets
const metersToLatDegrees = (meters: number) => meters / 111320;

function makeParkingFeature(
  lon: number,
  lat: number,
  properties: Record<string, unknown> = {}
): Feature {
  return {
    type: 'Feature',
    geometry: {type: 'Point', coordinates: [lon, lat]},
    properties,
  };
}

function makeSubmission(
  id: number,
  longitude: number,
  latitude: number
): SubmissionApiPayload {
  return {
    id,
    latitude,
    longitude,
    issues: [IssueType.Damaged],
    parking_time: '2026-01-01T12:00:00.000Z',
    parking_duration: ParkingDuration.Hours,
    comments: '',
    submitted_datetime: '2026-01-01T12:00:00.000Z',
    user: null,
  };
}

describe('matchSubmissionsToParking', () => {
  test('matches a submission to a parking feature within the radius', () => {
    const feature = makeParkingFeature(baseLon, baseLat);
    const submission = makeSubmission(
      1,
      baseLon,
      baseLat + metersToLatDegrees(5)
    );

    const matches = matchSubmissionsToParking([submission], [feature], 15);

    expect(matches.get(parkingFeatureKey({}, baseLon, baseLat))).toEqual([
      submission,
    ]);
  });

  test('excludes a submission beyond the radius', () => {
    const feature = makeParkingFeature(baseLon, baseLat);
    const submission = makeSubmission(
      1,
      baseLon,
      baseLat + metersToLatDegrees(50)
    );

    const matches = matchSubmissionsToParking([submission], [feature], 15);

    expect(matches.size).toBe(0);
  });

  test('groups multiple submissions matched to the same parking feature', () => {
    const feature = makeParkingFeature(baseLon, baseLat);
    const submissionA = makeSubmission(
      1,
      baseLon,
      baseLat + metersToLatDegrees(2)
    );
    const submissionB = makeSubmission(
      2,
      baseLon,
      baseLat - metersToLatDegrees(2)
    );

    const matches = matchSubmissionsToParking(
      [submissionA, submissionB],
      [feature],
      15
    );

    expect(matches.get(parkingFeatureKey({}, baseLon, baseLat))).toEqual([
      submissionA,
      submissionB,
    ]);
  });

  test('matches across adjacent grid cells when within radius of a cell boundary', () => {
    // radius small enough that the grid cell size is also small, so a
    // feature and submission a few meters apart can still land in
    // neighbouring cells
    const radiusMeters = 10;
    const feature = makeParkingFeature(baseLon, baseLat);
    // placed just far enough to likely cross into an adjacent grid cell,
    // but still within the match radius
    const submission = makeSubmission(
      1,
      baseLon,
      baseLat + metersToLatDegrees(radiusMeters - 1)
    );

    const matches = matchSubmissionsToParking(
      [submission],
      [feature],
      radiusMeters
    );

    expect(matches.get(parkingFeatureKey({}, baseLon, baseLat))).toEqual([
      submission,
    ]);
  });

  test('parkingFeatureKey is stable against small coordinate noise from vector-tile requantization', () => {
    // A parking feature clicked on the map is read back from MapLibre's
    // vector tiles rather than the raw fetched GeoJSON, which can shift a
    // coordinate by a few centimetres. These two pairs are a real example of
    // that: same feature, coordinates a few cm apart, straddling what used
    // to be a 6-decimal rounding boundary (43.653659 vs 43.653660).
    const rawCoords: [number, number] = [-79.3848049, 43.653659499999996];
    const tileCoords: [number, number] = [-79.3848049454391, 43.65365950747071];

    expect(parkingFeatureKey({}, ...rawCoords)).toEqual(
      parkingFeatureKey({}, ...tileCoords)
    );
  });

  test('uses a stable id property instead of coordinates when one is available', () => {
    // same coordinates, but a real id should take priority over the
    // coordinate fallback
    const key = parkingFeatureKey(
      {meta_osm_id: 'node/12245059976'},
      baseLon,
      baseLat
    );

    expect(key).not.toEqual(parkingFeatureKey({}, baseLon, baseLat));
    expect(key).toContain('node/12245059976');
  });

  test('two distinct nearby features with different ids do not collide, even at identical coordinates', () => {
    // real example from the parking data: two entries from different
    // sources describing what may be the same physical rack, at the exact
    // same coordinates - rounding alone could never separate these
    const featureA = makeParkingFeature(baseLon, baseLat, {
      'ref:open.toronto.ca:street-furniture-bicycle-parking:id': 'BP-05894',
    });
    const featureB = makeParkingFeature(baseLon, baseLat, {
      'ref:open.toronto.ca:street-furniture-bicycle-parking:id': 'BP-29396',
    });
    const submissionA = makeSubmission(1, baseLon, baseLat);
    const submissionB = makeSubmission(2, baseLon, baseLat);

    const matches = matchSubmissionsToParking(
      [submissionA, submissionB],
      [featureA, featureB],
      15
    );

    expect(matches.size).toBe(2);
    expect(
      matches.get(parkingFeatureKey(featureA.properties, baseLon, baseLat))
    ).toEqual([submissionA, submissionB]);
    expect(
      matches.get(parkingFeatureKey(featureB.properties, baseLon, baseLat))
    ).toEqual([submissionA, submissionB]);
  });

  test('returns an empty map when there are no submissions or no parking features', () => {
    const feature = makeParkingFeature(baseLon, baseLat);
    const submission = makeSubmission(1, baseLon, baseLat);

    expect(matchSubmissionsToParking([], [feature]).size).toBe(0);
    expect(matchSubmissionsToParking([submission], []).size).toBe(0);
  });
});
