import {useQuery} from '@tanstack/react-query';
import type {FeatureCollection, Point} from 'geojson';
import type {StolenBikeReport} from '@/interfaces/BikeTheftProperties';

// Fetch the bike theft reports from the configured URL
export async function fetchBikeTheftReports(
  url: string | undefined,
  signal?: AbortSignal
): Promise<StolenBikeReport[]> {
  if (!url) throw new Error('DATA_BICYCLE_THEFT is not configured');
  const response = await fetch(url, {signal});
  if (!response.ok)
    throw new Error(`Failed to load reports: ${response.status}`);
  const data: FeatureCollection<Point, StolenBikeReport> =
    await response.json();
  if (data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
    throw new Error('Expected a GeoJSON FeatureCollection');
  }
  return data.features
    .filter(feature => {
      const geometry = feature?.geometry;
      if (geometry?.type !== 'Point' || !Array.isArray(geometry.coordinates)) {
        return false;
      }
      // Validate that the coordinates are valid longitude and latitude values
      const [longitude, latitude] = geometry.coordinates;
      return (
        Number.isFinite(longitude) &&
        Number.isFinite(latitude) &&
        longitude >= -180 &&
        longitude <= 180 &&
        latitude >= -90 &&
        latitude <= 90 &&
        // Exclude Null Island without rejecting the equator or prime meridian.
        !(longitude === 0 && latitude === 0)
      );
    })
    .map(({properties, geometry}) => ({
      ...properties,
      longitude: geometry.coordinates[0],
      latitude: geometry.coordinates[1],
    }));
}

export function useBikeTheftDataQuery() {
  const url = process.env.DATA_BICYCLE_THEFT;
  return useQuery({
    queryKey: ['bicycleTheft', url],
    queryFn: ({signal}) => fetchBikeTheftReports(url, signal),
    staleTime: Infinity,
  });
}
