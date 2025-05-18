import React, {ChangeEvent, useState, useEffect} from 'react';
import {useQuery} from '@tanstack/react-query';

import {getCentroid, torontoBBox} from '@/utils/map-utils';

import type {Feature, FeatureCollection} from 'geojson';
import type {LngLatLike, MapRef} from 'react-map-gl/dist/esm/exports-maplibre';

import styles from './geocoder-search.module.scss';

import closeMenu from '@/assets/icons/close-menu.svg';

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
  const {housenumber, street, city} = feature.properties as {
    [key: string]: string;
  };
  const address = [
    [housenumber, street].filter(x => x?.length > 0).join(' '),
    city,
  ]
    .filter(x => x?.length > 0)
    .join(', ');
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
  bbox?: string;
}

export function GeocoderSearch({
  map,
  inputTimeOut = 300,
  resultsLimit = 5,
  defaultZoom = 17,
  bbox = torontoBBox.getURLParams(),
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
    const request = `https://photon.komoot.io/api/?q=${encodeURI(query)}&limit=${resultsLimit}&lat=${mapViewCenter.lat}&lon=${mapViewCenter.lng}&bbox=${bbox}`;
    const response = await fetch(request);
    const geojson: FeatureCollection = await response.json();
    return geojson;
  }

  const query = useQuery({
    queryKey: ['geocoderSearch', debouncedInputValue],
    queryFn: () =>
      debouncedInputValue.length > 0
        ? forwardGeocode(debouncedInputValue, map!.getCenter())
        : null,
  });

  function handleSelect(feature: Feature) {
    const location = getCentroid(feature) as LngLatLike;
    map!.flyTo({center: location, zoom: defaultZoom});
  }

  return (
    <div className={styles.geocoderSearchContainer}>
      <div className={styles.geocoderSearchInput}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Search for a Location"
        />
        {inputValue.length > 0 ? (
          <button
            onClick={() => {
              setDebouncedInputValue('');
              setInputValue('');
            }}
          >
            <img src={closeMenu.src} alt="Clear Location Search" height={14} />
          </button>
        ) : null}
      </div>
      {(query.isFetching || inputValue !== debouncedInputValue) &&
      inputValue.length > 0 ? (
        <div className={styles.geocoderResults}>
          <div className={styles.geocoderResultLoading}>Searching...</div>
        </div>
      ) : query.data ? (
        <div className={styles.geocoderResults}>
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
    </div>
  );
}
