import React from 'react';
import {Layer, Source} from 'react-map-gl/maplibre';

import type {SymbolLayer} from 'react-map-gl/maplibre';
import type {ExpressionSpecification} from 'maplibre-gl';
import type {FeatureCollection} from 'geojson';

import styles from './legend-tables.module.scss';

export const reportedIssuesSourceId = 'bicycle-parking-reports';
// keep in sync with the paint properties on reportedIssuesLayer below
const reportedIssuesBadgeColor = '#c62828';

interface ReportedIssuesLayerProps {
  reportedFeatures: FeatureCollection;
}

// Purely a visual indicator - not included in parkingInteractiveLayers, so
// clicks still resolve against the underlying ParkingLayer feature beneath.
export function ReportedIssuesLayer({
  reportedFeatures,
}: ReportedIssuesLayerProps) {
  // only show badges once individual parking icons are visible, matching
  // the zoom threshold ParkingLayer uses to fade in its own icons
  const reportedIssuesOpacity: ExpressionSpecification = [
    'interpolate',
    ['linear'],
    ['zoom'],
    16,
    0,
    16.05,
    1,
  ];

  const reportedIssuesLayer: SymbolLayer = {
    id: 'bicycle-parking-reports',
    type: 'symbol',
    source: reportedIssuesSourceId,
    layout: {
      // MapLibre's SDF glyphs only cover the font's own character ranges
      // (see the font-fallback comment in ParkingLayer.tsx) - emoji/symbol
      // characters like a warning triangle silently fail to render, so
      // this uses a plain "!" instead.
      'text-field': '!',
      'text-size': 18,
      'text-offset': [1, -1],
      'text-anchor': 'center',
      'text-allow-overlap': true,
      'text-ignore-placement': true,
      // Open Sans Bold is not in the Protomaps backup tile glyph set
      'text-font': process.env.MAPTILER_API_KEY
        ? ['Open Sans Bold']
        : ['Noto Sans Medium'],
    },
    paint: {
      'text-opacity': reportedIssuesOpacity,
      'text-color': reportedIssuesBadgeColor,
      'text-halo-color': 'white',
      'text-halo-width': 1.5,
    },
  };

  return (
    <Source id={reportedIssuesSourceId} type="geojson" data={reportedFeatures}>
      <Layer {...reportedIssuesLayer} />
    </Source>
  );
}

export function ReportedIssuesLegend() {
  return (
    <>
      <h3>Reported Issues</h3>
      <table className={styles.legendTable}>
        <thead>
          <tr>
            <th style={{textAlign: 'center'}}>Icon</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{textAlign: 'center'}}>
              <span
                role="img"
                aria-label="Red exclamation mark badge"
                style={{
                  display: 'inline-block',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  lineHeight: 1,
                  color: reportedIssuesBadgeColor,
                  textShadow:
                    '1px 1px white, -1px -1px white, 1px -1px white, -1px 1px white',
                }}
              >
                !
              </span>
            </td>
            <td>Parking feature has a user-submitted report</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
