import type {ComponentProps} from 'react';
import {GeocoderSearch} from '@/utils/map-utils';

type BikeTheftGeocoderSearchProps = Pick<
  ComponentProps<typeof GeocoderSearch>,
  'mapRef' | 'isMinimized' | 'setIsMinimized'
>;
export function BikeTheftGeocoderSearch(props: BikeTheftGeocoderSearchProps) {
  return (
    <GeocoderSearch
      {...props}
      selectResultEvent="stolen-map-select-geosearch-result"
      clearSearchEvent="stolen-map-clear-geosearch"
      geosearchErrorEvent="stolen-map-geosearch-error"
    />
  );
}
