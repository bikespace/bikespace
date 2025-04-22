import React from 'react';

import type {Feature} from 'geojson';

import {bicycleParkingDescriptions as bpDesc} from './bicycle_parkingDescriptions';
import styles from './parking-feature-description.module.scss';

export interface ParkingFeatureDescriptionProps {
  selected: boolean;
  hovered: boolean;
  feature: Feature;
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

  function getSourceLink(feature: Feature) {
    const properties = feature.properties;
    if (!properties) return null;
    if (properties.meta_source === 'OpenStreetMap') {
      const [type, id] = properties.meta_osm_id.split('/');
      return (
        <p>
          Source:{' '}
          <a
            href={`https://www.openstreetmap.org/${properties.meta_osm_id}`}
            target="_blank"
          >
            OpenStreetMap
          </a>
          {' ('}
          <a
            href={`https://www.openstreetmap.org/edit?${type}=${id}#hashtags=bikespaceto`}
            target="_blank"
          >
            edit
          </a>
          )
        </p>
      );
    } else if (properties.meta_source === 'City of Toronto') {
      // Exclude un-navigable source urls from clusters (separated by '|' character)
      const sourceUrl =
        properties.meta_source_url.search(/\|/) > 0
          ? null
          : properties.meta_source_url;
      return (
        <p>
          Source:{' '}
          {sourceUrl ? (
            <a href={sourceUrl} target="_blank">
              City of Toronto
            </a>
          ) : (
            'City of Toronto'
          )}
        </p>
      );
    } else if (properties.meta_source) {
      return <p>Source: {properties.meta_source}</p>;
    }
    return null;
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
      {getSourceLink(feature)}
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
