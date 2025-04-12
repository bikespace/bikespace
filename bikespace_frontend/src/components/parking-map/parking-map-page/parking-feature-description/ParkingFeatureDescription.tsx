import React from 'react';
import {MapGeoJSONFeature} from 'maplibre-gl';

import {bicycleParkingDescriptions as bpDesc} from './bicycle_parkingDescriptions';
import styles from './parking-feature-description.module.scss';

export interface ParkingFeatureDescriptionProps {
  selected: boolean;
  hovered: boolean;
  feature: MapGeoJSONFeature;
  handleClick: Function;
  handleHover: Function;
  handleUnHover: Function;
}

export function ParkingFeatureDescription({
  selected,
  hovered,
  feature,
  handleClick,
  handleHover,
  handleUnHover,
}: ParkingFeatureDescriptionProps) {
  if (!feature.properties) {
    return <p>Feature has no properties</p>;
  }

  const {
    bicycle_parking,
    capacity,
    description,
    covered,
    cargo_bike,
    fee,
    image,
    operator,
    meta_osm_id,
  } = feature.properties;

  const parkingTypeDescription = bicycle_parking
    ? bpDesc?.[bicycle_parking] ?? bicycle_parking
    : 'Unknown Type';
  const capacityDescription = capacity
    ? `🚲 x ${capacity}`
    : 'Unknown Capacity';

  const indicators = [];
  if (covered === 'yes') indicators.push('☂️');
  if (fee === 'yes') indicators.push('💲');
  const indicatorList =
    indicators.length > 0 ? ' ' + indicators.join(' ') : null;

  return (
    <div
      className={
        hovered || selected
          ? styles.featureDescriptionSelected
          : styles.featureDescription
      }
    >
      <h3>
        <a
          href="#"
          onClick={(e: React.MouseEvent) => handleClick(e, feature)}
          onMouseOver={(e: React.MouseEvent) => handleHover(e, feature)}
          onMouseOut={() => handleUnHover()}
        >
          {parkingTypeDescription} ({capacityDescription}){indicatorList}
        </a>
      </h3>
      {description ? (
        <p>
          <em>{description}</em>
        </p>
      ) : null}
      {covered === 'yes' ? <p>☂️ covered</p> : null}
      {cargo_bike === 'yes' || cargo_bike === 'designated' ? (
        <p>
          📦 cargo bike friendly
          {feature.properties['capacity:cargo_bike']
            ? ` (🚲 x ${feature.properties['capacity:cargo_bike']})`
            : null}
        </p>
      ) : null}
      {fee === 'yes' ? <p>💲 requires payment</p> : null}
      {image ? (
        <p>
          📷{' '}
          <a href={image} target="_blank">
            {image}
          </a>
        </p>
      ) : null}
      {operator ? <p>Operator: {operator}</p> : null}
      {meta_osm_id ? (
        <p>
          <a
            href={`https://www.openstreetmap.org/${meta_osm_id}`}
            target="_blank"
          >
            View on OpenStreetMap
          </a>
        </p>
      ) : null}

      <details className={styles.featureDescriptionAllData}>
        <summary>All Data</summary>
        <div className={styles.featureDescriptionAllDataContent}>
          {Object.entries(feature.properties).map(([k, v]) => {
            return (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            );
          })}
        </div>
      </details>
    </div>
  );
}
