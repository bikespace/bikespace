import React, {useEffect, useState} from 'react';
import {Layer, Marker, Source, useMap} from 'react-map-gl/maplibre';

import {getCentroid, getSpriteImageWithTextOverlay} from '@/utils/map-utils';

import type {CircleLayer, SymbolLayer} from 'react-map-gl/maplibre';
import type {
  ExpressionSpecification,
  FilterSpecification,
  MapGeoJSONFeature,
} from 'maplibre-gl';
import type {layoutOptions} from '@/utils/map-utils';

import styles from '../legend-tables.module.scss';

import parkingSpriteImage from '@/public/parking_sprites/parking_sprites@2x.png';
import parkingSpriteJSON from '@/public/parking_sprites/parking_sprites@2x.json';

export const parkingInteractiveLayers = ['bicycle-parking'];

// access=* values that indicate that bicycle parking is open to the public
const publicAccessTypes = ['yes', 'permissive', ''];

interface ParkingLayerProps {
  selected: MapGeoJSONFeature[];
  groupSelected: MapGeoJSONFeature[];
}

export function ParkingLayer({selected, groupSelected}: ParkingLayerProps) {
  const bicycleParkingURL = process.env.DATA_BICYCLE_PARKING_UNCLUSTERED;

  const {current: map} = useMap();

  // Update opacity of features that will be / were 'manually' rendered
  // (ParkingLayer style uses the 'groupSelected' custom property to set opacity to 100%)
  const [prevGroupSelected, setPrevGroupSelected] = useState<
    MapGeoJSONFeature[]
  >([]);
  useEffect(() => {
    setPrevGroupSelected(groupSelected);
    if (prevGroupSelected.length > 0) {
      for (const old_f of prevGroupSelected) {
        map!.setFeatureState(
          {source: old_f.source, id: old_f.id},
          {groupSelected: false}
        );
      }
    }
    if (groupSelected.length > 0) {
      for (const f of groupSelected) {
        map!.setFeatureState(
          {source: f.source, id: f.id},
          {groupSelected: true}
        );
      }
    }
  }, [groupSelected]);

  // Should show:
  // - Street furniture features (unmatched) where `bicycle_parking` type is unknown or `rack`
  // - All unmatched data from racks, high capacity, or bike stations
  const questFilter: FilterSpecification = [
    'any',
    [
      'match',
      ['get', 'meta_source_dataset'],
      'street-furniture-bicycle-parking',
      false,
      true,
    ],
    ['!', ['has', 'bicycle_parking']],
    ['match', ['get', 'bicycle_parking'], 'rack', true, false],
  ];

  // Type key
  const parkingTypes = {
    stands: {
      types: ['bollard', 'stands', 'post_hoop', 'hoops', 'wide_stands'],
      color: '#136329',
    },
    racks: {
      types: ['rack', 'safe_loops', 'two-tier'],
      color: '#0000E5',
    },
    wheelBenders: {
      types: [
        'wall_loops',
        'wave',
        'ground_slots',
        'handlebar_holder',
        'crossbar',
        'anchors',
        'lean_and_stick',
      ],
      color: '#d99726',
    },
    secure: {
      types: ['lockers', 'building', 'shed'],
      color: '#dc267f',
    },
    none: {
      types: ['None'],
      color: '#777777',
    },
  };

  const parkingLayerOpacity: ExpressionSpecification = [
    'interpolate',
    ['linear'],
    ['zoom'],
    16,
    0,
    16.05,
    ['case', ['boolean', ['feature-state', 'groupSelected'], false], 0, 1],
  ];
  const parkingLayer: SymbolLayer = {
    id: 'bicycle-parking',
    type: 'symbol',
    source: 'bicycle-parking',
    filter: questFilter,
    layout: {
      'icon-image': [
        'match',
        ['to-string', ['get', 'access']],
        publicAccessTypes,
        'parking:parking_unselected',
        'parking:private_unselected',
      ],
      'icon-anchor': 'bottom',
      'icon-overlap': 'always',
      'icon-size': 40 / 140,
      'text-field': [
        'match',
        ['get', 'capacity'],
        '2',
        ' ',
        ['get', 'capacity'],
      ],
      'text-size': 8,
      // Open Sans Bold is not in Protomaps backup tile glyph set
      'text-font': process.env.MAPTILER_API_KEY
        ? ['Open Sans Bold']
        : ['Noto Sans Medium'],
      'text-anchor': 'top',
      'text-offset': [0, -2.6],
      'text-overlap': 'never',
      'text-ignore-placement': true,
      'text-optional': true,
    },
    paint: {
      'icon-opacity': parkingLayerOpacity,
      'text-opacity': parkingLayerOpacity,
    },
  };

  const parkingLayerDenseOpacity: ExpressionSpecification = [
    'interpolate',
    ['linear'],
    ['zoom'],
    16,
    ['case', ['boolean', ['feature-state', 'groupSelected'], false], 0, 1],
    16.05,
    0,
  ];
  const parkingLayerDense: CircleLayer = {
    id: 'bicycle-parking-dense',
    type: 'circle',
    source: 'bicycle_parking',
    filter: questFilter,
    paint: {
      'circle-color': [
        'match',
        ['get', 'bicycle_parking'],
        parkingTypes.stands.types,
        parkingTypes.stands.color,
        parkingTypes.racks.types,
        parkingTypes.racks.color,
        parkingTypes.wheelBenders.types,
        parkingTypes.wheelBenders.color,
        parkingTypes.secure.types,
        parkingTypes.secure.color,
        parkingTypes.none.types,
        parkingTypes.none.color,
        parkingTypes.none.color, // no match fallback
      ],
      'circle-radius': 4,
      'circle-stroke-width': 2,
      'circle-stroke-color': 'white',
      // 'circle-opacity': parkingLayerDenseOpacity,
      // 'circle-stroke-opacity': parkingLayerDenseOpacity,
    },
  };

  const selectedMarkerLayoutProperties: Partial<layoutOptions> = {
    'icon-size': 44 / 140,
    'text-size': 8,
    'text-anchor': 'top',
    'text-offset': [0, -2.3],
    'text-font': ['Open Sans Bold'],
  };

  return (
    <>
      <Source
        id="bicycle-parking"
        type="geojson"
        data={bicycleParkingURL}
        generateId={true}
      >
        <Layer {...parkingLayer} />
        <Layer {...parkingLayerDense} />
      </Source>
      {groupSelected.map(feature => {
        const [lon, lat] = getCentroid(feature);
        return (
          <Marker
            key={feature.id}
            latitude={lat}
            longitude={lon}
            anchor="bottom"
            offset={[0, 6]}
            style={{cursor: 'pointer'}}
          >
            {getSpriteImageWithTextOverlay(
              parkingSpriteImage,
              parkingSpriteJSON,
              {
                'icon-image': publicAccessTypes.includes(
                  feature.properties?.access ?? ''
                )
                  ? 'parking:parking_sidebar'
                  : 'parking:private_sidebar',
                'text-field':
                  feature.properties?.capacity &&
                  feature.properties?.capacity !== '2'
                    ? feature.properties.capacity
                    : '',
                ...selectedMarkerLayoutProperties,
              } as layoutOptions,
              ''
            )}
          </Marker>
        );
      })}
      {selected.map(feature => {
        const [lon, lat] = getCentroid(feature);
        return (
          <Marker
            key={feature.id}
            latitude={lat}
            longitude={lon}
            anchor="bottom"
            offset={[0, 6]}
            style={{cursor: 'pointer'}}
          >
            {getSpriteImageWithTextOverlay(
              parkingSpriteImage,
              parkingSpriteJSON,
              {
                'icon-image': publicAccessTypes.includes(
                  feature.properties?.access ?? ''
                )
                  ? 'parking:parking_selected'
                  : 'parking:private_selected',
                'text-field':
                  feature.properties?.capacity &&
                  feature.properties?.capacity !== '2'
                    ? feature.properties.capacity
                    : '',
                ...selectedMarkerLayoutProperties,
              } as layoutOptions,
              ''
            )}
          </Marker>
        );
      })}
    </>
  );
}

export function ParkingLayerLegend() {
  const legendEntries = [
    {
      icon: 'parking:parking_unselected',
      alt: 'Map icon with an illustration of a bicycle',
      description: 'Public bicycle parking',
    },
    {
      icon: 'parking:private_unselected',
      alt: 'Map icon with an illustration of a key',
      description: 'Private bicycle parking',
    },
  ];

  return (
    <>
      <h3>Bicycle Parking</h3>
      <p>Number on icons indicates capacity</p>
      <table className={styles.legendTable}>
        <thead>
          <tr>
            <th style={{textAlign: 'center'}}>Icon</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {legendEntries.map(entry => (
            <tr key={entry.icon}>
              <td style={{textAlign: 'center'}}>
                {getSpriteImageWithTextOverlay(
                  parkingSpriteImage,
                  parkingSpriteJSON,
                  {
                    'icon-image': entry.icon,
                    'icon-size': 40 / 140,
                    'text-field': '#',
                    'text-size': 8,
                    'text-anchor': 'top',
                    'text-offset': [0, -2.6],
                    'text-font': ['Open Sans Bold'],
                  } as layoutOptions,
                  entry.alt
                )}
              </td>
              <td>{entry.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
