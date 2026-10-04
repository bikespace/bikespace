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
it('reports missing configuration', async () => {
  await expect(fetchBikeTheftReports(undefined)).rejects.toThrow(
    'not configured'
  );
});
