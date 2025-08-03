import {useQuery} from '@tanstack/react-query';
import type {FeatureCollection} from 'geojson';

export function useParkingDataQuery() {
  const bicycleParkingURL = process.env.DATA_BICYCLE_PARKING as string;

  const query = useQuery({
    queryKey: ['bicycleParking'],
    queryFn: async () => {
      const res = await fetch(bicycleParkingURL);
      const data: FeatureCollection = await res.json();
      return data;
    },
    select: data => data.features,
    staleTime: Infinity, // Only fetch data once per app load
  });

  return query;
}
