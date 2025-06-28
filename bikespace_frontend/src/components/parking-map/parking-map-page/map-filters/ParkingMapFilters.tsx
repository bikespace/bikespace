import React, {useEffect, useState} from 'react';

import {useForm} from 'react-hook-form';

import {parkingSourceId} from '@/components/map-layers/parking';

import type {RefObject} from 'react';
import type {MapSourceDataEvent} from 'maplibre-gl';
import type {MapRef} from 'react-map-gl/dist/esm/exports-maplibre';

interface ParkingMapFiltersProps {
  mapRef: RefObject<MapRef>;
}

const filterProperty = 'meta_source';

export function ParkingMapFilters({mapRef}: ParkingMapFiltersProps) {
  const {register} = useForm();

  const [sourceOptions, setSourceOptions] = useState<Set<string>>(new Set());
  const [selectedSourceOptions, setSelectedSourceOptions] = useState<
    Set<string>
  >(new Set());

  const loadData = (e: MapSourceDataEvent) => {
    if (e.sourceId === parkingSourceId && e.isSourceLoaded) {
      mapRef.current!.off('sourcedata', loadData);
      const features = mapRef.current!.querySourceFeatures(parkingSourceId);
      const newSourceOptions: Set<string> = new Set(
        features.map(f => f.properties[filterProperty] ?? 'undefined')
      );
      setSourceOptions(new Set(newSourceOptions));
      setSelectedSourceOptions(new Set(newSourceOptions));
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.on('sourcedata', loadData);
  }, [mapRef.current]);

  return (
    <>
      <div>Filter</div>
      <fieldset>
        <legend>Select Source</legend>
        {[...sourceOptions].map(option => (
          <div key={option}>
            <input
              type="checkbox"
              id={option}
              name={option}
              checked={selectedSourceOptions.has(option)}
              onChange={e => {
                e.target.checked
                  ? selectedSourceOptions.add(option)
                  : selectedSourceOptions.delete(option);
                setSelectedSourceOptions(new Set(selectedSourceOptions));
              }}
            />
            <label htmlFor={option}>{option}</label>
          </div>
        ))}
      </fieldset>
    </>
  );
}
