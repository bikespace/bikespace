import React, {useEffect, useState} from 'react';
import {Layer, Marker, Source, useMap} from 'react-map-gl/maplibre';

import {getCentroid, getSpriteImageWithTextOverlay} from '@/utils/map-utils';

import type {CircleLayer, SymbolLayer} from 'react-map-gl/maplibre';
import type {
  ExpressionSpecification,
  MapGeoJSONFeature,
  FilterSpecification,
} from 'maplibre-gl';
import type {layoutOptions} from '@/utils/map-utils';

import styles from '../legend-tables.module.scss';

import parkingSpriteImage from '@/public/parking_sprites/parking_sprites@2x.png';
import parkingSpriteJSON from '@/public/parking_sprites/parking_sprites@2x.json';

export const parkingSourceId = 'bicycle-parking';
export const parkingInteractiveLayers = ['bicycle-parking'];

// access=* values that indicate that bicycle parking is open to the public
const publicAccessTypes = ['yes', 'permissive', ''];

interface ParkingLayerProps {
  selected: MapGeoJSONFeature[];
  groupSelected: MapGeoJSONFeature[];
  layerFilter?: FilterSpecification;
  firstLayerId?: string;
}

export function ParkingLayer({
  selected,
  groupSelected,
  layerFilter = true,
  firstLayerId = 'bicycle-parking-dense',
}: ParkingLayerProps) {
  const bicycleParkingURL = process.env.DATA_BICYCLE_PARKING;

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
    source: parkingSourceId,
    filter: layerFilter,
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
    id: firstLayerId,
    type: 'circle',
    source: parkingSourceId,
    filter: layerFilter,
    paint: {
      'circle-color': [
        'match',
        ['to-string', ['get', 'access']],
        publicAccessTypes,
        '#136329',
        '#b3b3b3',
      ],
      'circle-radius': 3,
      'circle-stroke-width': 2,
      'circle-stroke-color': 'white',
      'circle-opacity': parkingLayerDenseOpacity,
      'circle-stroke-opacity': parkingLayerDenseOpacity,
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
        id={parkingSourceId}
        type="geojson"
        data={bicycleParkingURL}
        generateId={true}
        attribution="City of Toronto"
      >
        <Layer {...parkingLayerDense} />
        <Layer {...parkingLayer} />
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
