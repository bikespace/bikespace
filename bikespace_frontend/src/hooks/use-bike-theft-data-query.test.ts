import {fetchBikeTheftReports} from './use-bike-theft-data-query';

const originalFetch = global.fetch;
afterEach(() => {
  global.fetch = originalFetch;
});
it('unwraps properties and uses geometry coordinates', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {id: '4', date: '2025-01-01', latitude: 0, longitude: 0},
          geometry: {type: 'Point', coordinates: [-79.4, 43.6]},
        },
      ],
    }),
  });
  await expect(
    fetchBikeTheftReports('https://example.com/reports.geojson')
  ).resolves.toEqual([
    {id: '4', date: '2025-01-01', longitude: -79.4, latitude: 43.6},
  ]);
});
it('reports HTTP failures instead of returning an empty dataset', async () => {
  global.fetch = jest.fn().mockResolvedValue({ok: false, status: 404});
  await expect(
    fetchBikeTheftReports('https://example.com/reports.geojson')
  ).rejects.toThrow('404');
});

it.each([
  null,
  undefined,
  {type: 'LineString', coordinates: [[-79.4, 43.6]]},
  {type: 'Point'},
  {type: 'Point', coordinates: null},
  {type: 'Point', coordinates: 'invalid'},
  ...[
    [],
    [-79.4],
    [null, 43.6],
    [-79.4, null],
    ['-79.4', 43.6],
    [-79.4, '43.6'],
    [NaN, 43.6],
    [-79.4, Infinity],
    [-Infinity, 43.6],
    [-180.1, 43.6],
    [180.1, 43.6],
    [-79.4, -90.1],
    [-79.4, 90.1],
    [0, 0],
  ].map(coordinates => ({type: 'Point', coordinates})),
])(
  'excludes invalid geometry %j while retaining valid reports',
  async geometry => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        type: 'FeatureCollection',
        features: [
          {type: 'Feature', properties: {id: 'invalid'}, geometry},
          {
            type: 'Feature',
            properties: {id: 'valid'},
            geometry: {type: 'Point', coordinates: [-79.4, 43.6]},
          },
        ],
      }),
    });
    await expect(
      fetchBikeTheftReports('https://example.com/reports.geojson')
    ).resolves.toEqual([{id: 'valid', longitude: -79.4, latitude: 43.6}]);
  }
);

it.each([
  [0, 43.6],
  [-79.4, 0],
  [-180, -90],
  [180, 90],
  [-79.4, 43.6, 100],
])('retains valid coordinates %j', async (...coordinates) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {id: 'valid'},
          geometry: {type: 'Point', coordinates},
        },
      ],
    }),
  });
  await expect(
    fetchBikeTheftReports('https://example.com/reports.geojson')
  ).resolves.toEqual([
    {
      id: 'valid',
      longitude: coordinates[0],
      latitude: coordinates[1],
    },
  ]);
});
it('reports missing configuration', async () => {
  await expect(fetchBikeTheftReports(undefined)).rejects.toThrow(
    'not configured'
  );
});
