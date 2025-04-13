import {useQuery} from '@tanstack/react-query';
import type {FeatureCollection} from 'geojson';
import localData from '@/assets/all_sources.json';

export function useParkingMapQuery() {
  const bicycleParkingURL =
    'https://raw.githubusercontent.com/bikespace/parking-map-data/refs/heads/main/Display%20Files/all_sources.geojson';

  const query = useQuery({
    queryKey: ['parking_locations'],
    queryFn: async () => {
      // const res = await fetch(bicycleParkingURL);
      // const data: FeatureCollection = await res.json();
      // return data;
      return localData as FeatureCollection;
    },
    select: data => {
      const features = data.features
        // .slice(0, 100)
        .filter(feature => feature.geometry.type === 'Point');
      return features;
    },
    staleTime: Infinity, // Only fetch data once per app load
  });

  return query;
}
