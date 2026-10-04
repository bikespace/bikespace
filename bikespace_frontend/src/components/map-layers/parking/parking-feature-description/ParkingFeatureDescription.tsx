import React, {useState} from 'react';
import {DateTime} from 'luxon';

import type {Feature} from 'geojson';

import {SidebarButton} from '@/components/shared-ui/sidebar-button';
import {IssueBadge} from '@/components/dashboard/issue-badge';
import {SubmissionApiPayload} from '@/interfaces/Submission';
import {issuePriority} from '@/config/bikespace-api';

import {bicycleParkingDescriptions as bpDesc} from './bicycle_parkingDescriptions';
import styles from '../feature-description.module.scss';

import chevronUp from '@/assets/icons/chevron-up.svg';
import chevronDown from '@/assets/icons/chevron-down.svg';

export interface ParkingFeatureDescriptionProps {
  selected: boolean;
  hovered: boolean;
  feature: Feature;
  handleClick: Function;
  handleHover: Function;
  handleUnHover: Function;
  centerFeatureOnMap: Function;
  onReportIssue: (feature: Feature) => void;
  linkedReports?: SubmissionApiPayload[];
}

export function ParkingFeatureDescription({
  selected,
  hovered,
  feature,
  handleClick,
  handleHover,
  handleUnHover,
  centerFeatureOnMap,
  onReportIssue,
  linkedReports = [],
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

  function SourceLink({feature}: {feature: Feature}) {
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

  function FeatureHeading({
    bicycle_parking,
    capacity,
  }: {
    bicycle_parking: string;
    capacity: string;
  }) {
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
  }

  function FeatureDescription({description}: {description: string}) {
    return description ? (
      <p>
        <em>{description}</em>
      </p>
    ) : null;
  }

  function FeatureCovered({covered}: {covered: string}) {
    return covered === 'yes' ? (
      <p>
        <span aria-hidden={true}>☂️</span> covered
      </p>
    ) : null;
  }

  function FeatureCargoBikeFriendly({feature}: {feature: Feature}) {
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

  function FeatureHasFee({fee}: {fee: string}) {
    return fee === 'yes' ? (
      <p>
        <span aria-hidden={true}>💲</span> requires payment
      </p>
    ) : null;
  }

  function FeatureImageLink({image}: {image: string}) {
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
  }

  function FeatureOperator({operator}: {operator: string}) {
    return operator ? <p>Operator: {operator}</p> : null;
  }

  function LinkedReports({reports}: {reports: SubmissionApiPayload[]}) {
    if (reports.length === 0) return null;
    return (
      <div className={styles.linkedReports}>
        <h4>
          {reports.length} User {reports.length === 1 ? 'Report' : 'Reports'}
        </h4>
        {reports.map(report => (
          <div key={report.id} className={styles.linkedReport}>
            <div className={styles.issues}>
              {[...new Set(report.issues)]
                .sort((a, b) => issuePriority[a] - issuePriority[b])
                .map(issue => (
                  <IssueBadge issue={issue} key={issue} />
                ))}
            </div>
            {report.comments && <p>{report.comments}</p>}
            <p>
              <a href={`/dashboard?submission_id=${report.id}`}>
                {DateTime.fromISO(report.parking_time).toRelativeCalendar()}
              </a>
            </p>
          </div>
        ))}
      </div>
    );
  }

  function AllData({feature}: {feature: Feature}) {
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
    <>
      <div
        className={
          hovered || selected
            ? styles.featureDescriptionSelected
            : styles.featureDescription
        }
        onMouseEnter={(e: React.MouseEvent) => handleHover(e, feature)}
        onMouseLeave={() => handleUnHover()}
      >
        <FeatureHeading bicycle_parking={bicycle_parking} capacity={capacity} />
        <FeatureDescription description={description} />
        <FeatureCovered covered={covered} />
        <FeatureCargoBikeFriendly feature={feature} />
        <FeatureHasFee fee={fee} />
        <FeatureImageLink image={image} />
        <FeatureOperator operator={operator} />
        <SourceLink feature={feature} />
        <LinkedReports reports={linkedReports} />
        <div className={styles.featureDescriptionControls}>
          <SidebarButton
            onClick={(e: React.MouseEvent) => {
              centerFeatureOnMap(feature);
              if (!selected) handleClick(e, feature);
            }}
            umamiEvent="parking-feature-select-on-map"
          >
            {selected ? 'Center on Map' : 'Select on Map'}
          </SidebarButton>
          <SidebarButton
            onClick={() => onReportIssue(feature)}
            umamiEvent="parking-feature-report-issue"
          >
            Report Issue
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
            {showAllData ? 'Hide' : 'Show'} All Data
            <img
              src={showAllData ? chevronUp.src : chevronDown.src}
              alt=""
              style={{paddingLeft: 4}}
            />
          </SidebarButton>
        </div>
        <AllData feature={feature} />
      </div>
      <div className={styles.divider}></div>
    </>
  );
}
