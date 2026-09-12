import React from 'react';
import {Layer, Source} from 'react-map-gl/maplibre';

import type {FillLayer} from 'react-map-gl/maplibre';
import type {ExpressionSpecification} from 'maplibre-gl';

import styles from './legend-tables.module.scss';

// Neighbourhoods with fewer estimated daily bike trips than this are too noisy to rate
// reliably — matches min_bike_trips in the parking-map-data pipeline
// (src/bikespace_data/bicycle_theft/run_theft_rate_zones.py)
const MIN_RELIABLE_BIKE_TRIPS = 10;
const unreliableColor = '#d9d9d9';

const theftRateBreaks = [
  {upTo: 0.5, color: '#fff5f0', label: '< 0.5'},
  {upTo: 1, color: '#fcbba1', label: '0.5 – 1'},
  {upTo: 1.5, color: '#fc9272', label: '1 – 1.5'},
  {upTo: 2, color: '#fb6a4a', label: '1.5 – 2'},
  {upTo: 3, color: '#de2d26', label: '2 – 3'},
  {upTo: Infinity, color: '#a50f15', label: '3+'},
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
  [
    'step',
    ['get', 'theft_per_1000_trips'],
    theftRateBreaks[0].color,
    theftRateBreaks[0].upTo,
    theftRateBreaks[1].color,
    theftRateBreaks[1].upTo,
    theftRateBreaks[2].color,
    theftRateBreaks[2].upTo,
    theftRateBreaks[3].color,
    theftRateBreaks[3].upTo,
    theftRateBreaks[4].color,
  ],
] as unknown as ExpressionSpecification;

export function TheftRateLayer({beforeId}: {beforeId?: string}) {
  const theftRateURL = process.env.DATA_BICYCLE_THEFT;

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
    <Source id="bicycle-theft-rate" type="geojson" data={theftRateURL}>
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
      <p>Est. thefts per 1000 bike trips, typical day, by neighbourhood</p>
      <table className={styles.legendTable}>
        <thead>
          <tr>
            <th style={{textAlign: 'center'}}>Color</th>
            <th>Rate</th>
          </tr>
        </thead>
        <tbody>
          {theftRateBreaks.map(entry => (
            <tr key={entry.label}>
              <td style={{textAlign: 'center'}}>{swatch(entry.color)}</td>
              <td>{entry.label}</td>
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
