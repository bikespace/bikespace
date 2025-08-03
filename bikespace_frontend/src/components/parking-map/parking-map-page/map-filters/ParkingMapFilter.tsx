import React, {useEffect, useState, useMemo} from 'react';

import {useForm} from 'react-hook-form';

import {useParkingDataQuery} from '@/hooks';
import {parkingSourceId} from '@/components/map-layers/parking';
import {SidebarButton} from '@/components/dashboard/sidebar-button';

import type {RefObject} from 'react';
import type {Feature, Geometry, GeoJsonProperties} from 'geojson';
import type {FilterSpecification, MapSourceDataEvent} from 'maplibre-gl';
import type {MapRef} from 'react-map-gl/dist/esm/exports-maplibre';

interface ParkingMapFilterProps {
  mapRef: RefObject<MapRef>;
  setFilter: React.Dispatch<React.SetStateAction<FilterSpecification>>;
}

function transformPropertyOptions(
  input: string | undefined,
  outputFormat:
    | 'stringValue'
    | 'description'
    | 'expressionValue' = 'stringValue'
): string | null {
  const edgeCases = {
    isUndefined: {
      stringValue: '__undefined__',
      description: '(not specified)',
      expressionValue: null,
    },
    isBlankString: {
      stringValue: '__blank__',
      description: '(blank)',
      expressionValue: '',
    },
  };

  if (input === undefined || input === edgeCases.isUndefined.stringValue) {
    return edgeCases.isUndefined[outputFormat];
  } else if (input === '' || input === edgeCases.isBlankString.stringValue) {
    return edgeCases.isBlankString[outputFormat];
  } else {
    return input;
  }
}

const defaultFilterProperty = 'meta_source';

export function ParkingMapFilter({mapRef, setFilter}: ParkingMapFilterProps) {
  const {register} = useForm(); // TODO keep or remove
  const {status, data, error} = useParkingDataQuery();

  const [features, setFeatures] = useState<
    Feature<Geometry, GeoJsonProperties>[]
  >([]);
  const [filterProperty, setFilterProperty] = useState<string>(
    defaultFilterProperty
  );
  const [selectedPropertyOptions, setSelectedPropertyOptions] = useState<
    Set<string>
  >(new Set());

  useEffect(() => {
    if (status !== 'success') return;
    setFeatures(data);
  }, [status]);

  const filterPropertyList: string[] = useMemo(() => {
    const newPropertyList: Set<string> = new Set(
      features.flatMap(f => Object.keys(f.properties as Object))
    );
    return [...newPropertyList].toSorted();
  }, [features]);

  const propertyOptions: Set<string> = useMemo(() => {
    const newPropertyOptions: Set<string> = new Set(
      features
        .map(
          f =>
            transformPropertyOptions(
              f.properties?.[filterProperty],
              'stringValue'
            ) as string
        )
        .toSorted()
    );
    return newPropertyOptions;
  }, [features, filterProperty]);

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
        [
          'literal',
          [...selectedPropertyOptions].map(option =>
            transformPropertyOptions(option, 'expressionValue')
          ),
        ],
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
      <div style={{display: 'flex', margin: '4px 0', gap: '4px'}}>
        <SidebarButton
          onClick={() => setSelectedPropertyOptions(new Set(propertyOptions))}
        >
          Select All
        </SidebarButton>
        <SidebarButton onClick={() => setSelectedPropertyOptions(new Set())}>
          Clear All
        </SidebarButton>
      </div>
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
            <label htmlFor={option}>
              {transformPropertyOptions(option, 'description')}
            </label>
          </div>
        ))}
      </fieldset>
    </div>
  );
}
