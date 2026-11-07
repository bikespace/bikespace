import {useQuery} from '@tanstack/react-query';
import type {FeatureCollection} from 'geojson';

export function useParkingClusterMembersQuery() {
  const clusterMembersURL = process.env
    .DATA_BICYCLE_PARKING_CLUSTER_MEMBERS as string;

  const query = useQuery({
    queryKey: ['bicycleParkingClusterMembers'],
    queryFn: async () => {
      const res = await fetch(clusterMembersURL);
      const data: FeatureCollection = await res.json();
      return data;
    },
    select: data => data.features,
    staleTime: Infinity, // Only fetch data once per app load
  });

  return query;
}
