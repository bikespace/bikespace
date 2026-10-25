import React from 'react';

import {Layer, Source} from 'react-map-gl/maplibre';

import {attributions} from '@/utils/map-utils';

import {
  getBikeSpaceStyleLayer,
  getBikeSpaceContrastOutlineLayer,
  bikeSpaceStyleLegendEntries,
} from './bikespaceTheme';
import {
  getMississaugaStyleLayer,
  getMississaugaStyleOutlineLayer,
  getMississaugaContrastOutlineLayer,
  mississaugaStyleLegendEntries,
} from './mississaugaTheme';
import {
  getTorontoStyleLayer,
  getTorontoStyleOverlayLayer,
  getTorontoContrastOutlineLayer,
  torontoStyleLegendEntries,
} from './torontoTheme';

import styles from '@/components/map-layers/legend-tables.module.scss';

export type BicycleNetworkTheme = 'bikespace' | 'mississauga' | 'toronto';

interface BicycleNetworkLayerProps {
  beforeId?: string;
  firstLayerId?: string;
  lastLayerId?: string;
  background?: 'light' | 'dark';
  theme?: BicycleNetworkTheme;
}

export function BicycleNetworkLayer({
  beforeId,
  firstLayerId = 'bicycle-lanes-first',
  lastLayerId = 'bicycle-lanes-last',
  background = 'light',
  theme = 'bikespace',
}: BicycleNetworkLayerProps) {
  const bicycleNetworkURL = process.env.DATA_BICYCLE_NETWORK;

  // set up styles - BikeSpace
  const bikeSpaceStyle = getBikeSpaceStyleLayer(firstLayerId);
  const bikespaceContrastOutline =
    getBikeSpaceContrastOutlineLayer(lastLayerId);

  // set up styles - Mississauga
  const mississaugaStyle = getMississaugaStyleLayer(firstLayerId);
  const mississaugaStyleOutline = getMississaugaStyleOutlineLayer(
    'bicycle-network-mississauga-style-outline'
  );
  const mississaugaContrastOutline = getMississaugaContrastOutlineLayer(
    lastLayerId,
    background === 'dark'
  );

  // set up styles - Toronto
  const torontoStyleOverlay = getTorontoStyleOverlayLayer(firstLayerId);
  const torontoStyle = getTorontoStyleLayer('bicycle-network-toronto-style');
  const torontoContrastOutline = getTorontoContrastOutlineLayer(
    lastLayerId,
    background === 'dark'
  );

  return (
    // Source does not allow for nested fragments, so each component has to be evaluated and returned one by one
    <Source
      id="bicycle-network"
      type="geojson"
      data={bicycleNetworkURL!}
      attribution={attributions['City of Toronto Open Data']}
    >
      {/* If BikeSpace theme is selected */}
      {theme === 'bikespace' ? (
        <Layer {...bikeSpaceStyle} key={beforeId} beforeId={beforeId} />
      ) : null}
      {theme === 'bikespace' && background === 'dark' ? (
        <Layer {...bikespaceContrastOutline} beforeId={bikeSpaceStyle.id} />
      ) : null}

      {/* If Mississauga theme is selected */}
      {theme === 'mississauga' ? (
        <Layer {...mississaugaStyle} key={beforeId} beforeId={beforeId} />
      ) : null}
      {theme === 'mississauga' ? (
        <Layer {...mississaugaStyleOutline} beforeId={mississaugaStyle.id} />
      ) : null}
      {theme === 'mississauga' && background === 'dark' ? (
        <Layer
          {...mississaugaContrastOutline}
          beforeId={mississaugaStyleOutline.id}
        />
      ) : null}

      {/* If Toronto theme is selected */}
      {theme === 'toronto' ? (
        <Layer {...torontoStyleOverlay} key={beforeId} beforeId={beforeId} />
      ) : null}
      {theme === 'toronto' ? (
        <Layer {...torontoStyle} beforeId={torontoStyleOverlay.id} />
      ) : null}
      {theme === 'toronto' && background === 'dark' ? (
        <Layer {...torontoContrastOutline} beforeId={torontoStyle.id} />
      ) : null}
    </Source>
  );
}

// TODO add Toronto to legend

export function BicycleNetworkLayerLegend({
  theme = 'bikespace',
}: {
  theme?: BicycleNetworkTheme;
}) {
  const legendEntries =
    theme === 'mississauga'
      ? mississaugaStyleLegendEntries
      : theme === 'toronto'
        ? torontoStyleLegendEntries
        : // default | theme === 'bikespace'
          bikeSpaceStyleLegendEntries;
  return (
    <>
      <h3>Bicycle Network</h3>
      <table className={styles.legendTable}>
        <thead>
          <tr>
            <th style={{textAlign: 'center'}}>Style</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {legendEntries.map(entry => (
            <tr key={entry.key}>
              <td>
                <img src={entry.icon} alt={entry.alt} width={44} />
              </td>
              <td>{entry.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
