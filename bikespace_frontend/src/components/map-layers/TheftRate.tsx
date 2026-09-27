import React from 'react';
import {Layer, Source} from 'react-map-gl/maplibre';

import type {FillLayer} from 'react-map-gl/maplibre';
import type {ExpressionSpecification} from 'maplibre-gl';

import styles from './legend-tables.module.scss';

// Zones with fewer estimated daily bike trips than this are too noisy to rate
// reliably — matches the min_bike_trips default in the parking-map-data pipeline
// (src/bikespace_data/bicycle_theft/run_theft_rate_zones.py)
const MIN_RELIABLE_BIKE_TRIPS = 100;
const unreliableColor = '#d9d9d9';

// Thefts per 1000 daily bike trips. Static breaks sitting near the 20th/40th/60th/80th/95th
// percentiles of the reliable zones; revisit if the pipeline's rate scale changes.
const theftRateStops = [0.018, 0.03, 0.045, 0.08, 0.16];
const theftRateColors = [
  '#fff5f0',
  '#fcbba1',
  '#fc9272',
  '#fb6a4a',
  '#de2d26',
  '#a50f15',
];
const theftRateBreaks = theftRateColors.map((color, i) => ({
  color,
  label:
    i === 0
      ? `< ${theftRateStops[0]}`
      : i === theftRateStops.length
        ? `${theftRateStops[i - 1]}+`
        : `${theftRateStops[i - 1]} – ${theftRateStops[i]}`,
}));

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
    theftRateColors[0],
    ...theftRateStops.flatMap((stop, i) => [stop, theftRateColors[i + 1]]),
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
      <p>Est. thefts per 1000 bike trips, typical day, by area</p>
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
