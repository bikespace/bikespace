import {findWaterLayerId} from './TheftRate';

import type {Map as MapLibreMap} from 'maplibre-gl';

const mapWithLayers = (layers: object[]) =>
  ({getStyle: () => ({layers})}) as unknown as MapLibreMap;

describe('findWaterLayerId', () => {
  test('returns the first fill layer drawn from the water source-layer', () => {
    const map = mapWithLayers([
      {id: 'background', type: 'background'},
      {id: 'water-line', type: 'line', 'source-layer': 'water'},
      {id: 'water', type: 'fill', 'source-layer': 'water'},
    ]);
    expect(findWaterLayerId(map)).toBe('water');
  });

  test('returns undefined when the style has no water fill layer', () => {
    const map = mapWithLayers([{id: 'roads', type: 'line'}]);
    expect(findWaterLayerId(map)).toBeUndefined();
  });
});
