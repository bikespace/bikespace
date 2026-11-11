import React from 'react';
import {Layer, Source} from 'react-map-gl/maplibre';

import {attributions} from '@/utils/map-utils';

import type {FillLayer} from 'react-map-gl/maplibre';
import type {ExpressionSpecification, Map as MapLibreMap} from 'maplibre-gl';

import styles from './legend-tables.module.scss';

// Zones with fewer estimated daily bike trips than this are too noisy to rate
// reliably — matches the min_bike_trips default in the parking-map-data pipeline
// (src/bikespace_data/bicycle_theft/run_theft_rate_zones.py)
const MIN_RELIABLE_BIKE_TRIPS = 100;
const unreliableColor = '#d9d9d9';

// Thefts per 1000 daily bike trips. Static breaks sitting near the 20th/40th/60th/80th/95th
// percentiles of the reliable zones; revisit if the pipeline's rate scale changes.
const theftRateBands = [
  {label: '< 0.018', color: '#fff5f0', min: 0, max: 0.018},
  {label: '0.018 – 0.03', color: '#fcbba1', min: 0.018, max: 0.03},
  {label: '0.03 – 0.045', color: '#fc9272', min: 0.03, max: 0.045},
  {label: '0.045 – 0.08', color: '#fb6a4a', min: 0.045, max: 0.08},
  {label: '0.08 – 0.16', color: '#de2d26', min: 0.08, max: 0.16},
  {label: '0.16+', color: '#a50f15', min: 0.16, max: Infinity},
];

// maplibre's ExpressionSpecification union can't be inferred from a plain nested-array
// literal like this one — the runtime shape is valid maplibre expression syntax, so we
// assert the type rather than fight the compiler's structural inference here.
const theftRateFillColor = [
  'case',
  [
    'any',
    ['==', ['get', 'theft_per_1000_trips'], null],
    ['<', ['coalesce', ['get', 'bike_trips'], 0], MIN_RELIABLE_BIKE_TRIPS],
  ],
  unreliableColor,
  // 'step' picks the color of the highest band whose min is <= the value
  [
    'step',
    ['get', 'theft_per_1000_trips'],
    theftRateBands[0].color,
    ...theftRateBands.slice(1).flatMap(band => [band.min, band.color]),
  ],
] as unknown as ExpressionSpecification;

/**
 * Returns the id of the basemap's water fill layer, if any. Inserting an overlay
 * below this layer keeps it from tinting lakes and rivers.
 */
export function findWaterLayerId(map: MapLibreMap): string | undefined {
  return map
    .getStyle()
    .layers.find(
      layer => layer.type === 'fill' && layer['source-layer'] === 'water'
    )?.id;
}

export function TheftRateLayer({beforeId}: {beforeId?: string}) {
  const theftRateURL = process.env.DATA_BICYCLE_THEFT_RATE;

  const theftRateLayer: FillLayer = {
    id: 'bicycle-theft-rate',
    type: 'fill',
    source: 'bicycle-theft-rate',
    paint: {
      'fill-color': theftRateFillColor,
      'fill-opacity': 0.7,
      'fill-outline-color': 'rgba(255, 255, 255, 0.6)',
    },
  };

  return (
    <Source
      id="bicycle-theft-rate"
      type="geojson"
      data={theftRateURL}
      attribution={attributions['City of Toronto Open Data']}
    >
      <Layer {...theftRateLayer} beforeId={beforeId} />
    </Source>
  );
}

export function TheftRateLayerLegend() {
  const swatch = (color: string) => (
    <span
      style={{
        display: 'inline-block',
        width: 20,
        height: 20,
        backgroundColor: color,
        border: '1px solid #999',
      }}
      aria-hidden="true"
    />
  );

  return (
    <>
      <h3>Estimated Bicycle Theft Rate</h3>
      <p>Est. thefts per 1000 bike trips, typical day, by area</p>
      <table className={styles.legendTable}>
        <thead>
          <tr>
            <th style={{textAlign: 'center'}}>Color</th>
            <th>Rate</th>
          </tr>
        </thead>
        <tbody>
          {theftRateBands.map(band => (
            <tr key={band.label}>
              <td style={{textAlign: 'center'}}>{swatch(band.color)}</td>
              <td>{band.label}</td>
            </tr>
          ))}
          <tr>
            <td style={{textAlign: 'center'}}>{swatch(unreliableColor)}</td>
            <td>Not enough bike trip data for a reliable estimate</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
