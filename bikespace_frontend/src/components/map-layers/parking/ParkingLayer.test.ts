import {markerTextField} from './ParkingLayer';

import type {MapGeoJSONFeature} from 'maplibre-gl';

function feature(properties: Record<string, unknown>): MapGeoJSONFeature {
  return {properties} as unknown as MapGeoJSONFeature;
}

describe('markerTextField', () => {
  test('shows the cluster member index, when present, over capacity', () => {
    expect(
      markerTextField(feature({clusterMemberIndex: 2, capacity: '6'}))
    ).toBe('#2');
  });

  test('falls back to capacity when there is no cluster member index', () => {
    expect(markerTextField(feature({capacity: '6'}))).toBe('6');
  });

  test('shows nothing for capacity of exactly 2 (default icon already implies it)', () => {
    expect(markerTextField(feature({capacity: '2'}))).toBe('');
  });

  test('shows nothing when neither a cluster member index nor a capacity is set', () => {
    expect(markerTextField(feature({}))).toBe('');
  });
});
