import {useQuery} from '@tanstack/react-query';
import {DateTime} from 'luxon';

// Fetch the Last-Modified date (user's local time, YYYY-MM-DD) of the LTS pmtiles file
export async function fetchLtsDataLastModified(
  url: string | undefined,
  signal?: AbortSignal
): Promise<string | null> {
  if (!url) throw new Error('DATA_LEVEL_OF_TRAFFIC_STRESS is not configured');
  // 1-byte GET range rather than HEAD: sw.js only caches/serves GETs
  const response = await fetch(url, {headers: {Range: 'bytes=0-0'}, signal});
  if (!response.ok)
    throw new Error(`Failed to load LTS data headers: ${response.status}`);
  const lastModified = response.headers.get('Last-Modified');
  if (!lastModified) return null;
  const date = DateTime.fromHTTP(lastModified); // defaults to the browser's zone
  return date.isValid ? date.toISODate() : null;
}

export function useLtsDataLastModifiedQuery() {
  const url = process.env.DATA_LEVEL_OF_TRAFFIC_STRESS;
  return useQuery({
    queryKey: ['ltsDataLastModified', url],
    queryFn: ({signal}) => fetchLtsDataLastModified(url, signal),
    staleTime: Infinity,
  });
}
