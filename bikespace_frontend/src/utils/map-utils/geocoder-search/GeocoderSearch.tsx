import React, {ChangeEvent, useState, useEffect} from 'react';
import {Marker} from 'maplibre-gl';

import {useGeocoderQuery} from './_useGeocoderQuery';
import {getCentroid, torontoBBox} from '@/utils/map-utils';
import {trackUmamiEvent, titleCase} from '@/utils';

import type {Feature, FeatureCollection} from 'geojson';
import type {LngLatLike, MapRef} from 'react-map-gl/dist/esm/exports-maplibre';
import type {UseQueryResult} from '@tanstack/react-query';

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
        <strong>
          {feature?.properties?.name ??
            (feature?.properties?.type
              ? titleCase(feature?.properties?.type)
              : 'Unnamed Location')}
        </strong>
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

interface SearchResultsProps {
  isMinimized: boolean;
  disableResults: boolean;
  inputValue: string;
  debouncedInputValue: string;
  query: UseQueryResult<FeatureCollection | null, Error>;
  selectedResult: Feature | null;
  handleSelect: Function;
}

function SearchResults({
  isMinimized,
  disableResults,
  inputValue,
  debouncedInputValue,
  query,
  selectedResult,
  handleSelect,
}: SearchResultsProps) {
  if (inputValue.length === 0) return null;

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
        const isSelected =
          selectedResult?.properties?.osm_id === properties.osm_id &&
          selectedResult?.properties?.osm_type === properties.osm_type;
        return !isMinimized || isSelected ? (
          <GeocoderResult
            key={i}
            feature={f}
            handleSelect={() => handleSelect(f)}
            isDisabled={disableResults}
            isSelected={isSelected}
          />
        ) : null;
      });
    } else {
      searchResults = (
        <div className={styles.geocoderResultPlaceholder}>No results found</div>
      );
    }
  } else {
    searchResults = (
      <div className={styles.geocoderResultPlaceholder}>Search Error</div>
    );
    trackUmamiEvent('parking-map-geosearch-error', {
      query: debouncedInputValue,
      apiErrorName: query.error?.name ?? '',
      apiErrorMessage: query.error?.message ?? '',
    });
  }

  return <div className={styles.geocoderResults}>{searchResults}</div>;
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

  // Get location search results using the photon API
  // Prioritize map centre and limit to Toronto bounding box
  const query = useGeocoderQuery(
    debouncedInputValue,
    map ? map.getCenter() : undefined,
    bbox,
    resultsLimit
  );

  function handleSelect(feature: Feature) {
    setSelectedResult(feature);
    trackUmamiEvent('parking-map-select-geosearch-result');
  }

  function handleClearSearch() {
    setDebouncedInputValue('');
    setInputValue('');
    setSelectedResult(null);
    setIsMinimized(false);
    trackUmamiEvent('parking-map-clear-geosearch');
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
          <button onClick={handleClearSearch}>
            <img src={closeMenu.src} alt="Clear Location Search" height={14} />
          </button>
        ) : null}
      </div>
      <SearchResults
        isMinimized={isMinimized}
        disableResults={!map}
        inputValue={inputValue}
        debouncedInputValue={debouncedInputValue}
        query={query}
        selectedResult={selectedResult}
        handleSelect={handleSelect}
      />
    </div>
  );
}
