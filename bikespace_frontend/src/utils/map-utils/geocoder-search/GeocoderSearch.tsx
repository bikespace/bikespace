import React, {ChangeEvent, useState, useEffect} from 'react';
import {useQuery} from '@tanstack/react-query';

import {getCentroid} from '@/utils/map-utils';

import type {Feature, FeatureCollection} from 'geojson';
import type {LngLatLike, MapRef} from 'react-map-gl/dist/esm/exports-maplibre';

import styles from './geocoder-search.module.scss';

interface GeocoderResultProps {
  feature: Feature;
  handleSelect: Function;
  isDisabled: boolean;
}

function GeocoderResult({
  feature,
  handleSelect,
  isDisabled,
}: GeocoderResultProps) {
  const {housenumber, street, city} = feature.properties as any;
  const address = [[housenumber, street].join(' '), city].join(', ');
  return (
    <div className={styles.geocoderResult}>
      <button disabled={isDisabled} onClick={() => handleSelect()}>
        <strong>{feature?.properties?.name ?? 'Unnamed Location'}</strong>
        <br />
        {address}
      </button>
    </div>
  );
}

interface GeocoderSearchProps {
  map: MapRef | null;
  inputTimeOut?: number;
  resultsLimit?: number;
  defaultZoom?: number;
}

export function GeocoderSearch({
  map,
  inputTimeOut = 500,
  resultsLimit = 5,
  defaultZoom = 18,
}: GeocoderSearchProps) {
  const [inputValue, setInputValue] = useState('');
  const [debouncedInputValue, setDebouncedInputValue] = useState('');

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    const delayInputTimeoutID = setTimeout(() => {
      setDebouncedInputValue(inputValue);
    }, inputTimeOut);
    return () => clearTimeout(delayInputTimeoutID);
  }, [inputValue]);

  async function forwardGeocode(
    query: string,
    mapViewCenter: {lng: number; lat: number}
  ) {
    const request = `https://photon.komoot.io/api/?q=${encodeURI(query)}&limit=${resultsLimit}&lat=${mapViewCenter.lat}&lon=${mapViewCenter.lng}`;
    const response = await fetch(request);
    const geojson: FeatureCollection = await response.json();
    return geojson;
  }

  const query = useQuery({
    queryKey: ['geocoderSearch', debouncedInputValue],
    queryFn: () =>
      debouncedInputValue.length > 0 && map
        ? forwardGeocode(debouncedInputValue, map!.getCenter())
        : null,
  });
  if (query?.data) {
    console.log(query.data.features);
  }

  function handleSelect(feature: Feature) {
    const location = getCentroid(feature) as LngLatLike;
    map!.flyTo({center: location, zoom: defaultZoom});
  }

  return (
    <>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Search for a Location"
      />
      {query.data ? (
        <div>
          {query.data.features.map((f, i) => (
            <GeocoderResult
              key={i}
              feature={f}
              handleSelect={() => handleSelect(f)}
              isDisabled={!map}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
