import React, {ChangeEvent, useState, useEffect} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Marker} from 'maplibre-gl';

import {getCentroid, torontoBBox} from '@/utils/map-utils';

import type {Feature, FeatureCollection} from 'geojson';
import type {LngLatLike, MapRef} from 'react-map-gl/dist/esm/exports-maplibre';

import styles from './geocoder-search.module.scss';

import closeMenu from '@/assets/icons/close-menu.svg';

function getAddress(feature: Feature) {
  const {housenumber, street, city} = feature.properties as {
    [key: string]: string;
  };
  const address = [
    [housenumber, street].filter(x => x?.length > 0).join(' '),
    city,
  ]
    .filter(x => x?.length > 0)
    .join(', ');
  return address;
}

interface GeocoderResultProps {
  feature: Feature;
  handleSelect: Function;
  isDisabled: boolean;
  isSelected: boolean;
}

function GeocoderResult({
  feature,
  handleSelect,
  isDisabled,
  isSelected,
}: GeocoderResultProps) {
  const address = getAddress(feature);
  return (
    <div
      className={`${styles.geocoderResult}${isSelected ? ' ' + styles.selectedResult : ''}`}
    >
      <button disabled={isDisabled} onClick={() => handleSelect()}>
        <strong>{feature?.properties?.name ?? 'Unnamed Location'}</strong>
        <br />
        {address}
      </button>
    </div>
  );
}

function AnimatedEllipses() {
  return (
    <span className={styles.animatedEllipses}>
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </span>
  );
}

interface GeocoderSearchProps {
  map: MapRef | null;
  isMinimized: boolean;
  setIsMinimized: Function;
  inputTimeOut?: number;
  resultsLimit?: number;
  defaultZoom?: number;
  bbox?: string;
}

export function GeocoderSearch({
  map,
  isMinimized,
  setIsMinimized,
  inputTimeOut = 300,
  resultsLimit = 5,
  defaultZoom = 17,
  bbox = torontoBBox.getURLParams(),
}: GeocoderSearchProps) {
  // debouncedInputValue only updates every inputTimeout to minimize API requests
  const [inputValue, setInputValue] = useState('');
  const [debouncedInputValue, setDebouncedInputValue] = useState('');
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setIsMinimized(false);
  };
  useEffect(() => {
    const delayInputTimeoutID = setTimeout(() => {
      setDebouncedInputValue(inputValue);
    }, inputTimeOut);
    return () => clearTimeout(delayInputTimeoutID);
  }, [inputValue]);

  // Display a marker on the map for selected search result
  const [selectedResult, setSelectedResult] = useState<Feature | null>(null);
  useEffect(() => {
    if (!selectedResult) return;

    const location = getCentroid(selectedResult) as LngLatLike;
    const marker = new Marker({color: '#00a0cc'});
    marker.setLngLat(location).addTo(map!.getMap());
    map!.flyTo({center: location, zoom: defaultZoom});

    return () => {
      marker.remove();
    };
  }, [selectedResult]);

  function handleSelect(feature: Feature) {
    setSelectedResult(feature);
  }

  // Get location search results using the photon API
  // Prioritize map centre and limit to Toronto bounding box
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

  // minimize search results when parking features are selected
  useEffect(() => {
    if (!isMinimized || !selectedResult) return;

    const address = getAddress(selectedResult);
    const name = selectedResult?.properties?.name;
    setInputValue((name ? `${name}, ` : '') + address);
  }, [isMinimized]);

  function SearchResults() {
    if (isMinimized || inputValue.length === 0) return null;

    let searchResults;
    if (query.isFetching || inputValue !== debouncedInputValue) {
      searchResults = (
        <div className={styles.geocoderResultPlaceholder}>
          Searching
          <AnimatedEllipses />
        </div>
      );
    } else if (query.data) {
      if (query.data.features.length > 0) {
        searchResults = query.data.features.map((f, i) => {
          const properties = f.properties as {
            [key: string]: string;
          };
          return (
            <GeocoderResult
              key={i}
              feature={f}
              handleSelect={() => handleSelect(f)}
              isDisabled={!map}
              isSelected={
                selectedResult?.properties?.osm_id === properties.osm_id &&
                selectedResult?.properties?.osm_type === properties.osm_type
              }
            />
          );
        });
      } else {
        searchResults = (
          <div className={styles.geocoderResultPlaceholder}>
            No results found
          </div>
        );
      }
    } else {
      searchResults = (
        <div className={styles.geocoderResultPlaceholder}>Search Error</div>
      );
    }

    return <div className={styles.geocoderResults}>{searchResults}</div>;
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
              setSelectedResult(null);
              setIsMinimized(false);
            }}
          >
            <img src={closeMenu.src} alt="Clear Location Search" height={14} />
          </button>
        ) : null}
      </div>
      <SearchResults />
    </div>
  );
}
