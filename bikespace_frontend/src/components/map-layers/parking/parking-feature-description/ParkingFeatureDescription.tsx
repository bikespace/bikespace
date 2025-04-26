import React, {useState} from 'react';

import type {Feature} from 'geojson';

import {SidebarButton} from '@/components/dashboard/sidebar-button';

import {bicycleParkingDescriptions as bpDesc} from './bicycle_parkingDescriptions';
import styles from './parking-feature-description.module.scss';

import chevronUp from '@/assets/icons/chevron-up.svg';
import chevronDown from '@/assets/icons/chevron-down.svg';

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

  const [showAllData, setShowAllData] = useState<boolean>(false);

  // main features displayed
  // also includes `cargo_bike` and `capacity:cargo_bike`
  const {
    bicycle_parking,
    capacity,
    description,
    covered,
    fee,
    image,
    operator,
  } = feature.properties;

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
            aria-label="edit on OpenStreetMap"
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

  const getFeatureHeading = () => {
    const parkingTypeDescription = bicycle_parking
      ? bpDesc?.[bicycle_parking] ?? bicycle_parking
      : 'Unknown Type';
    const capacityDescription = capacity ? (
      <>
        <span role="img" aria-label="capacity">
          🚲 x{' '}
        </span>
        {capacity}
      </>
    ) : (
      'Unknown Capacity'
    );
    return (
      <h3>
        {parkingTypeDescription} ({capacityDescription})
      </h3>
    );
  };

  const getFeatureDescription = () => {
    return description ? (
      <p>
        <em>{description}</em>
      </p>
    ) : null;
  };

  const getFeatureCovered = () => {
    return covered === 'yes' ? (
      <p>
        <span aria-hidden={true}>☂️</span> covered
      </p>
    ) : null;
  };

  function getFeatureCargoBikeFriendly(feature: Feature) {
    if (!feature.properties) return null;
    const cargo_bike = feature.properties['cargo_bike'];
    return cargo_bike === 'yes' || cargo_bike === 'designated' ? (
      <p>
        <span aria-hidden={true}>📦</span> cargo bike friendly
        {feature.properties['capacity:cargo_bike'] ? (
          <>
            <span role="img" aria-label="cargo bike capacity">
              {' '}
              (🚲 x{' '}
            </span>
            {feature.properties['capacity:cargo_bike']})
          </>
        ) : null}
      </p>
    ) : null;
  }

  const getFeatureHasFee = () => {
    return fee === 'yes' ? (
      <p>
        <span aria-hidden={true}>💲</span> requires payment
      </p>
    ) : null;
  };

  const getFeatureImageLink = () => {
    return image ? (
      <p>
        <span role="img" aria-label="photo link">
          📷
        </span>{' '}
        <a href={image} target="_blank">
          {image}
        </a>
      </p>
    ) : null;
  };

  const getFeatureOperator = () =>
    operator ? <p>Operator: {operator}</p> : null;

  function getAllData(feature: Feature) {
    if (!feature.properties) return null;
    return showAllData ? (
      <div className={styles.featureDescriptionAllData}>
        <h4>All Data</h4>
        {Object.entries(feature.properties).map(([k, v]) => {
          return (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          );
        })}
      </div>
    ) : null;
  }

  return (
    <div
      className={
        hovered || selected
          ? styles.featureDescriptionSelected
          : styles.featureDescription
      }
      onMouseOver={(e: React.MouseEvent) => handleHover(e, feature)}
      onMouseOut={() => handleUnHover()}
    >
      {getFeatureHeading()}
      {getFeatureDescription()}
      {getFeatureCovered()}
      {getFeatureCargoBikeFriendly(feature)}
      {getFeatureHasFee()}
      {getFeatureImageLink()}
      {getFeatureOperator()}
      {getSourceLink(feature)}
      <div className={styles.featureDescriptionControls}>
        <SidebarButton
          onClick={(e: React.MouseEvent) => handleClick(e, feature)}
          disabled={selected}
          umamiEvent="parking-feature-select-on-map"
        >
          Select{selected ? 'ed' : ''} on Map
        </SidebarButton>
        <SidebarButton
          onClick={() => setShowAllData(!showAllData)}
          aria-expanded={showAllData ? 'true' : 'false'}
          umamiEvent={
            showAllData
              ? 'parking-feature-show-all-data'
              : 'parking-feature-hide-all-data'
          }
        >
          {showAllData ? 'Hide' : 'Show'} all Data
          <img
            src={showAllData ? chevronUp.src : chevronDown.src}
            alt=""
            style={{paddingLeft: 4}}
          />
        </SidebarButton>
      </div>
      {getAllData(feature)}
    </div>
  );
}
