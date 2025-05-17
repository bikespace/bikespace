import React, {ChangeEvent, useState, useEffect} from 'react';
import {useQuery} from '@tanstack/react-query';

import type {FeatureCollection, Feature} from 'geojson';

interface GeocoderSearchProps {
  inputTimeOut?: number;
  resultsLimit?: number;
}

export default function GeocoderSearch({
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

  return (
    <>
      <input type="text" value={inputValue} onChange={handleInputChange} />
      {query.data ? (
        <ul>
          {query.data.features.map(f => (
            <li>{f?.properties?.name ?? 'Unnamed Location'}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
