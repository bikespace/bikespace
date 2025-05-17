import React, {ChangeEvent, useState, useEffect} from 'react';
import {useQuery} from '@tanstack/react-query';

import {getCentroid} from '@/utils/map-utils/mapUtils';

import type {MouseEventHandler} from 'react';
import type {Feature, FeatureCollection} from 'geojson';
import type {LngLatLike, MapRef} from 'react-map-gl/dist/esm/exports-maplibre';

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
  return (
    <div>
      <button disabled={isDisabled} onClick={() => handleSelect()}>
        {feature?.properties?.name ?? 'Unnamed Location'}
      </button>
    </div>
  );
}

interface GeocoderSearchProps {
  map: MapRef | null;
  inputTimeOut?: number;
  resultsLimit?: number;
}

export default function GeocoderSearch({
  map,
  inputTimeOut = 500,
  resultsLimit = 5,
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

  async function forwardGeocode(query: string) {
    const request = `https://photon.komoot.io/api/?q=${encodeURI(query)}&limit=${resultsLimit}`;
    const response = await fetch(request);
    const geojson: FeatureCollection = await response.json();
    return geojson;
  }

  const query = useQuery({
    queryKey: ['geocoderSearch', debouncedInputValue],
    queryFn: () =>
      debouncedInputValue.length > 0
        ? forwardGeocode(debouncedInputValue)
        : null,
  });
  if (query?.data) {
    console.log(query.data.features);
  }

  function handleSelect(feature: Feature) {
    const location = getCentroid(feature) as LngLatLike;
    map!.flyTo({center: location, zoom: 18});
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
