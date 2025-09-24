import React, {useEffect, useState, useMemo} from 'react';

import {useParkingDataQuery} from '@/hooks';
import {SidebarButton} from '@/components/shared-ui/sidebar-button';
import {SidebarSelect} from '@/components/shared-ui/sidebar-select';

import {
  defaultEnabledFilterProperties,
  FilterPropertyAttributes,
  propertyTypeOptions,
} from './parking-map-filter-default-properties';

import type {RefObject} from 'react';
import type {Feature, Geometry, GeoJsonProperties} from 'geojson';
import type {FilterSpecification} from 'maplibre-gl';
import type {MapRef} from 'react-map-gl/dist/esm/exports-maplibre';

import styles from './parking-map-filter.module.scss';

/**
 * Convert property values that might be a blank string '', boolean, or undefined into representative string values, e.g.
 * - `''` -> `'(blank)'` (presentation) / `'__blank__'` (data)
 * - `undefined` -> `'(not specified)'` (presentation) / `'__undefined__'` (data)
 * - `false` -> `'False'` (presentation) / `'false'`
 *
 * Values that are already strings are returned unchanged. Converting all these values into strings allows for easier use in e.g. input elements.
 */
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

/**
 * Sorts property options (the set of values for a specific feature property over the whole dataset) according to the specified type:
 * - "string" properties are sorted alphabetically
 * - "integer" properties are sorted as follows: first, any non-numeric values are sorted alphabetically (e.g. text placeholders for blank or null values), then any numeric values are sorted from lowest to highest
 *
 * In either case, since the outputs are used for UI labels, the function returns a sorted Set with the values all returned as strings.
 */
function sortPropertyOptions(
  propertyOptions: Set<string>,
  propertyType: propertyTypeOptions
): Set<string> {
  let propertyOptionsSorted: string[];
  if (propertyType === propertyTypeOptions.String) {
    propertyOptionsSorted = [...propertyOptions].toSorted();
  } else if (propertyType === propertyTypeOptions.Integer) {
    const propertyOptionsList = [...propertyOptions];
    const numberProperties = propertyOptionsList.filter(
      x => !Number.isNaN(parseInt(x, 10))
    );
    const textProperties = propertyOptionsList.filter(x =>
      Number.isNaN(parseInt(x, 10))
    );
    const numberPropertiesSorted = numberProperties.toSorted(
      (a, b) => parseInt(a, 10) - parseInt(b, 10)
    );
    const textPropertiesSorted = textProperties.toSorted();
    propertyOptionsSorted = [
      ...textPropertiesSorted,
      ...numberPropertiesSorted,
    ];
  } else {
    propertyOptionsSorted = [...propertyOptions].toSorted();
  }
  return new Set(propertyOptionsSorted);
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

  // load combobox options when data arrives
  useEffect(() => {
    if (status !== 'success') return;
    setFeatures(data);
  }, [status]);

  // process property keys, give them more user-friendly names (if specified), and limit to specified keys if onlyShowEnabledFilterProperties = true
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
          type: propertyTypeOptions.String,
        } as FilterPropertyAttributes)
    );
    // sort property keys by alphabetical order of their display names
    return newPropertyListAttributes.toSorted((a, b) =>
      a.description.localeCompare(b.description, undefined, {
        sensitivity: 'base',
      })
    );
  }, [features]);

  // transform and sort property values for the selected key
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
      (enabledFilterPropertiesLookup[filterProperty]
        ?.type as propertyTypeOptions) ?? propertyTypeOptions.String;
    return sortPropertyOptions(newPropertyOptions, propertyType);
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

  function handleCheckboxChange(
    event: React.ChangeEvent<HTMLInputElement>,
    checkboxName: string
  ) {
    const newSelectedPropertyOptions = new Set(selectedPropertyOptions);
    event.target.checked
      ? newSelectedPropertyOptions.add(checkboxName)
      : newSelectedPropertyOptions.delete(checkboxName);
    setSelectedPropertyOptions(newSelectedPropertyOptions);
  }

  return (
    <div>
      <label
        htmlFor="filter-property-select"
        className={styles.filterPropertySelectLabel}
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
      <div className={styles.selectClearButtonContainer}>
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
          <div key={option} className={styles.styledCheckboxContainer}>
            <input
              type="checkbox"
              id={option}
              name={option}
              checked={selectedPropertyOptions.has(option)}
              onChange={e => handleCheckboxChange(e, option)}
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
