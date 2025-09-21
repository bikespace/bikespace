import React, {useEffect, useState, useMemo} from 'react';

import {useParkingDataQuery} from '@/hooks';
import {SidebarButton} from '@/components/shared-ui/sidebar-button';
import {SidebarSelect} from '@/components/shared-ui/sidebar-select';

import {
  defaultEnabledFilterProperties,
  FilterPropertyAttributes,
} from './parking-map-filter-default-properties';

import type {RefObject} from 'react';
import type {Feature, Geometry, GeoJsonProperties} from 'geojson';
import type {FilterSpecification} from 'maplibre-gl';
import type {MapRef} from 'react-map-gl/dist/esm/exports-maplibre';

function transformPropertyOptions(
  input: string | boolean | undefined,
  outputFormat:
    | 'stringValue'
    | 'description'
    | 'expressionValue' = 'stringValue'
): string | boolean | null {
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
    isTrue: {
      stringValue: 'true',
      description: 'True',
      expressionValue: true,
    },
    isFalse: {
      stringValue: 'false',
      description: 'False',
      expressionValue: false,
    },
  };

  if (input === undefined || input === edgeCases.isUndefined.stringValue) {
    return edgeCases.isUndefined[outputFormat];
  } else if (input === '' || input === edgeCases.isBlankString.stringValue) {
    return edgeCases.isBlankString[outputFormat];
  } else if (input === true || input === edgeCases.isTrue.stringValue) {
    return edgeCases.isTrue[outputFormat];
  } else if (input === false || input === edgeCases.isFalse.stringValue) {
    return edgeCases.isFalse[outputFormat];
  } else {
    return input;
  }
}

const defaultFilterProperty = 'bicycle_parking';

interface ParkingMapFilterProps {
  mapRef: RefObject<MapRef>;
  setFilter: React.Dispatch<React.SetStateAction<FilterSpecification>>;
  defaultProperty?: string;
  enabledFilterProperties?: FilterPropertyAttributes[];
  onlyShowEnabledFilterProperties?: boolean;
}

export function ParkingMapFilter({
  mapRef,
  setFilter,
  defaultProperty = defaultFilterProperty,
  enabledFilterProperties = defaultEnabledFilterProperties,
  onlyShowEnabledFilterProperties = true,
}: ParkingMapFilterProps) {
  const {status, data, error} = useParkingDataQuery();

  const enabledFilterPropertiesLookup = Object.fromEntries(
    enabledFilterProperties.map(attributes => [attributes.key, attributes])
  );

  const [features, setFeatures] = useState<
    Feature<Geometry, GeoJsonProperties>[]
  >([]);
  const [filterProperty, setFilterProperty] = useState<string>(defaultProperty);
  const [selectedPropertyOptions, setSelectedPropertyOptions] = useState<
    Set<string>
  >(new Set());

  useEffect(() => {
    if (status !== 'success') return;
    setFeatures(data);
  }, [status]);

  const filterPropertyList: FilterPropertyAttributes[] = useMemo(() => {
    const newPropertyList: Set<string> = new Set(
      features.flatMap(f => Object.keys(f.properties as Object))
    );
    const enabledPropertyList = onlyShowEnabledFilterProperties
      ? newPropertyList.intersection(
          new Set(enabledFilterProperties.map(attributes => attributes.key))
        )
      : newPropertyList;
    const newPropertyListAttributes: FilterPropertyAttributes[] = [
      ...enabledPropertyList,
    ].map(
      key =>
        enabledFilterPropertiesLookup[key] ??
        ({
          key: key,
          description: key,
          type: 'string',
        } as FilterPropertyAttributes)
    );
    return newPropertyListAttributes.toSorted((a, b) =>
      a.description.localeCompare(b.description, undefined, {
        sensitivity: 'base',
      })
    );
  }, [features]);

  const propertyOptions: Set<string> = useMemo(() => {
    const newPropertyOptions = new Set(
      features.map(
        f =>
          transformPropertyOptions(
            f.properties?.[filterProperty],
            'stringValue'
          ) as string
      )
    );
    const propertyType =
      enabledFilterPropertiesLookup[filterProperty]?.type ?? 'string';
    let newPropertyOptionsSorted: string[];
    if (propertyType === 'string') {
      newPropertyOptionsSorted = [...newPropertyOptions].toSorted();
    } else if (propertyType === 'integer') {
      const newPropertyOptionsList = [...newPropertyOptions];
      const numberProperties = newPropertyOptionsList.filter(
        x => !Number.isNaN(parseInt(x, 10))
      );
      const textProperties = newPropertyOptionsList.filter(x =>
        Number.isNaN(parseInt(x, 10))
      );
      const numberPropertiesSorted = numberProperties.toSorted(
        (a, b) => parseInt(a, 10) - parseInt(b, 10)
      );
      const textPropertiesSorted = textProperties.toSorted();
      newPropertyOptionsSorted = [
        ...textPropertiesSorted,
        ...numberPropertiesSorted,
      ];
    } else {
      newPropertyOptionsSorted = [...newPropertyOptions].toSorted();
    }
    return new Set(newPropertyOptionsSorted);
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
    <div>
      <label
        htmlFor="filter-property-select"
        style={{display: 'block', marginBottom: '4px'}}
      >
        Choose a property to filter by:
      </label>
      <SidebarSelect
        name="filter-property"
        id="filter-property-select"
        value={filterProperty}
        onChange={e => setFilterProperty(e.target.value)}
      >
        {filterPropertyList.map(attributes => (
          <option key={attributes.key} value={attributes.key}>
            {attributes.description}
          </option>
        ))}
      </SidebarSelect>
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
        <legend>
          Select {enabledFilterPropertiesLookup[filterProperty]?.description}:
        </legend>
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
