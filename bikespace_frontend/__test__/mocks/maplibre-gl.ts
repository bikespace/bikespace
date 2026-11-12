// maplibre-gl v6 is published as ESM only, which Jest's CommonJS resolver
// cannot load. This stub stands in for it in unit tests; tests that need
// specific behaviour can still override it with jest.mock('maplibre-gl', ...).

const mockMarker = {
  setLngLat: jest.fn().mockReturnThis(),
  addTo: jest.fn().mockReturnThis(),
  remove: jest.fn(),
};

const mockMap = {
  addControl: jest.fn(),
  on: jest.fn(),
  remove: jest.fn(),
  flyTo: jest.fn(),
  getCenter: jest.fn(),
};

export const Map = jest.fn(() => mockMap);
export const Marker = jest.fn(() => mockMarker);
export const addProtocol = jest.fn();
export const removeProtocol = jest.fn();
export const setWorkerUrl = jest.fn();
export const getVersion = jest.fn(() => 'test');
