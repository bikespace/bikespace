import {useQuery} from '@tanstack/react-query';
import type {FeatureCollection, Point} from 'geojson';
import type {StolenBikeReport} from '@/interfaces/BikeTheftProperties';

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
    .filter(
      feature =>
        feature.geometry?.type === 'Point' &&
        feature.geometry.coordinates.length >= 2 &&
        feature.geometry.coordinates.slice(0, 2).every(Number.isFinite)
    )
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
