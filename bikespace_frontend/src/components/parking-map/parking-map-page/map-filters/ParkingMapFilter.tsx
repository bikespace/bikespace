import React, {useEffect, useState, useMemo} from 'react';

import {useForm} from 'react-hook-form';

import {parkingSourceId} from '@/components/map-layers/parking';

import type {RefObject} from 'react';
import type {
  FilterSpecification,
  MapGeoJSONFeature,
  MapSourceDataEvent,
} from 'maplibre-gl';
import type {MapRef} from 'react-map-gl/dist/esm/exports-maplibre';

interface ParkingMapFilterProps {
  mapRef: RefObject<MapRef>;
  setFilter: React.Dispatch<React.SetStateAction<FilterSpecification>>;
}

const defaultFilterProperty = 'meta_source';

export function ParkingMapFilter({mapRef, setFilter}: ParkingMapFilterProps) {
  const {register} = useForm();

  const [features, setFeatures] = useState<MapGeoJSONFeature[]>([]);
  const [filterProperty, setFilterProperty] = useState<string>(
    defaultFilterProperty
  );
  const [selectedPropertyOptions, setSelectedPropertyOptions] = useState<
    Set<string>
  >(new Set());

  // set callback: load properties from source when it is loaded
  const loadData = (e: MapSourceDataEvent) => {
    if (e.sourceId === parkingSourceId && e.isSourceLoaded) {
      mapRef.current!.off('sourcedata', loadData);
      const features = mapRef.current!.querySourceFeatures(parkingSourceId);
      setFeatures(features);
    }
  };
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.on('sourcedata', loadData);
  }, [mapRef.current]);

  const filterPropertyList: string[] = useMemo(() => {
    const newPropertyList: Set<string> = new Set(
      features.flatMap(f => Object.keys(f.properties))
    );
    return [...newPropertyList].sort();
  }, [features]);

  const propertyOptions: Set<string> = useMemo(() => {
    const newPropertyOptions: Set<string> = new Set(
      features.map(f => f.properties[filterProperty] ?? '(undefined)')
    );
    return newPropertyOptions;
  }, [filterProperty]);

  // update property options and reset filter when features or selection changes
  useEffect(() => {
    setSelectedPropertyOptions(new Set(propertyOptions));
    setFilter(true);
  }, [features, filterProperty]);

  // set filter on map layer when user selection changes
  useEffect(() => {
    if (!mapRef.current) return;
    // clear filter if all options are selected
    if (propertyOptions.isSubsetOf(selectedPropertyOptions)) {
      setFilter(true);
    } else {
      setFilter([
        'in',
        ['get', filterProperty],
        ['literal', [...selectedPropertyOptions]],
      ]);
    }
  }, [selectedPropertyOptions]);

  return (
    <div style={{margin: '1rem 0'}}>
      <label htmlFor="filter-property-select">
        Choose a property to filter by:
      </label>
      <select
        name="filter-property"
        id="filter-property-select"
        value={filterProperty}
        onChange={e => setFilterProperty(e.target.value)}
        style={{maxWidth: '100%'}}
      >
        {filterPropertyList.map(p => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <fieldset>
        <legend>Select {filterProperty}</legend>
        {[...propertyOptions].map(option => (
          <div key={option}>
            <input
              type="checkbox"
              id={option}
              name={option}
              checked={selectedPropertyOptions.has(option)}
              onChange={e => {
                e.target.checked
                  ? selectedPropertyOptions.add(option)
                  : selectedPropertyOptions.delete(option);
                setSelectedPropertyOptions(new Set(selectedPropertyOptions));
              }}
            />
            <label htmlFor={option}>{option}</label>
          </div>
        ))}
      </fieldset>
    </div>
  );
}
