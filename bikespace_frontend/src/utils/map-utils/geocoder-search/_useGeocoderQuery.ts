import {useQuery} from '@tanstack/react-query';

import {defaultMapCenter} from '@/utils/map-utils';

import type {FeatureCollection} from 'geojson';

export function useGeocoderQuery(
  inputValue: string,
  mapViewCenter: {lng: number; lat: number} | undefined,
  bbox: string,
  resultsLimit: number
) {
  const query = useQuery({
    queryKey: ['geocoderSearch', inputValue],
    queryFn: async () => {
      if (inputValue.length === 0) return null;

      const request = `https://photon.komoot.io/api/?q=${encodeURI(
        inputValue
      )}&limit=${resultsLimit}&lat=${
        mapViewCenter?.lat ?? `${defaultMapCenter.latitude}`
      }&lon=${
        mapViewCenter?.lng ?? `${defaultMapCenter.longitude}`
      }&bbox=${bbox}`;
      const response = await fetch(request);
      const geojson: FeatureCollection = await response.json();

      return geojson;
    },
  });
  return query;
}
