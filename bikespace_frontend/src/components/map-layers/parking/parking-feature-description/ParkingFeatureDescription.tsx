import React, {useState} from 'react';
import {DateTime} from 'luxon';

import type {Feature} from 'geojson';

import {SidebarButton} from '@/components/shared-ui/sidebar-button';
import {IssueBadge} from '@/components/dashboard/issue-badge';
import {SubmissionApiPayload} from '@/interfaces/Submission';
import {issuePriority} from '@/config/bikespace-api';
import {getCentroid, metersOffsetFrom} from '@/utils/map-utils';

import {bicycleParkingDescriptions as bpDesc} from './bicycle_parkingDescriptions';
import styles from '../feature-description.module.scss';

import chevronUp from '@/assets/icons/chevron-up.svg';
import chevronDown from '@/assets/icons/chevron-down.svg';

export interface ClusterMember {
  feature: Feature;
  linkedReports?: SubmissionApiPayload[];
}

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
  clusterMembers?: ClusterMember[];
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
  clusterMembers = [],
}: ParkingFeatureDescriptionProps) {
  if (!feature.properties) {
    return <p>Feature has no properties</p>;
  }

  const [showAllData, setShowAllData] = useState<boolean>(false);
  const [showClusterMembers, setShowClusterMembers] = useState<boolean>(false);

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
    const clusterMemberIndex = feature.properties?.clusterMemberIndex;
    return (
      <h3>
        {clusterMemberIndex ? `#${clusterMemberIndex} ` : ''}
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

  // Maps a report's id to the cluster member(s) it's specifically attributed
  // to (via the tight-radius match computed in ParkingMapPage), so this
  // feature's own "all reports near this cluster" list can show which
  // reports are pinned to a rack vs. which can't be (filed too generally to
  // tell which rack in the cluster they're about). A report can legitimately
  // match more than one member when they sit closer together than the tight
  // match radius (e.g. two bollards 2m apart) - keep every match rather than
  // letting a later member silently overwrite an earlier one's claim, which
  // would make a report look unattributed-by-#8 even though drilling into
  // #8 on its own correctly shows it. Only meaningful when rendering the
  // top-level cluster feature - empty for an individual member (which
  // receives no clusterMembers of its own).
  const reportIdToMemberIndices = new Map<number, number[]>();
  for (const {
    feature: member,
    linkedReports: memberReports,
  } of clusterMembers) {
    const idx = memberIndex(member, 0);
    for (const report of memberReports ?? []) {
      const indices = reportIdToMemberIndices.get(report.id) ?? [];
      indices.push(idx);
      reportIdToMemberIndices.set(report.id, indices);
    }
  }

  function ReportCard({report}: {report: SubmissionApiPayload}) {
    return (
      <div className={styles.linkedReport}>
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
    );
  }

  function LinkedReports({reports}: {reports: SubmissionApiPayload[]}) {
    if (reports.length === 0) return null;

    const attributed = reports.filter(r => reportIdToMemberIndices.has(r.id));
    const general = reports.filter(r => !reportIdToMemberIndices.has(r.id));
    const showBreakdown = clusterMembers.length > 0 && attributed.length > 0;

    return (
      <div className={styles.linkedReports}>
        <h4>
          {reports.length} User {reports.length === 1 ? 'Report' : 'Reports'}
        </h4>
        {showBreakdown ? (
          <>
            {attributed.length > 0 && (
              <div
                className={`${styles.linkedReportsGroup} ${styles.linkedReportsGroupAttributed}`}
              >
                <h5>Reported on a specific rack</h5>
                {attributed.map(report => {
                  const indices = reportIdToMemberIndices.get(report.id)!;
                  return (
                    <div key={report.id}>
                      <p className={styles.linkedReportMemberTag}>
                        {indices.length === 1
                          ? `Rack #${indices[0]}`
                          : `Possibly rack ${indices.map(i => `#${i}`).join(' or ')} (too close together to tell apart)`}
                      </p>
                      <ReportCard report={report} />
                    </div>
                  );
                })}
              </div>
            )}
            {general.length > 0 && (
              <div
                className={`${styles.linkedReportsGroup} ${styles.linkedReportsGroupGeneral}`}
              >
                <h5>Rack not specified</h5>
                {general.map(report => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            )}
          </>
        ) : (
          reports.map(report => <ReportCard key={report.id} report={report} />)
        )}
      </div>
    );
  }

  function memberIndex(member: Feature, fallback: number): number {
    const index = member.properties?.clusterMemberIndex;
    return typeof index === 'number' ? index : fallback;
  }

  function ClusterMembersDiagram({members}: {members: ClusterMember[]}) {
    const [originLon, originLat] = getCentroid(feature);
    const points = members.map(({feature: member}, i) => ({
      member,
      index: memberIndex(member, i + 1),
      offset: metersOffsetFrom(getCentroid(member), [originLon, originLat]),
    }));

    // avoids a degenerate (infinite) scale on the rare chance every member
    // sits exactly on the cluster's own centroid
    const maxAbsOffset = Math.max(
      1,
      ...points.flatMap(({offset: [dx, dy]}) => [Math.abs(dx), Math.abs(dy)])
    );
    const size = 140;
    const center = size / 2;
    const dotRadius = 10;
    const scale = (center - dotRadius * 2) / maxAbsOffset;

    return (
      <>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          role="img"
          aria-label={`Approximate relative positions of the ${members.length} parking features in this cluster, numbered to match the list below. North is up.`}
          className={styles.clusterMembersDiagram}
        >
          <text
            x={center}
            y={12}
            textAnchor="middle"
            className={styles.diagramCompass}
          >
            N
          </text>
          <circle
            cx={center}
            cy={center}
            r={4}
            className={styles.diagramCenter}
          />
          {points.map(({member, index, offset: [dx, dy]}) => (
            <g
              key={index}
              // screen y grows downward, but north (increasing latitude)
              // should point up, so the vertical offset is subtracted
              // rather than added
              transform={`translate(${center + dx * scale}, ${center - dy * scale})`}
              className={styles.diagramMemberGroup}
              onMouseEnter={(e: React.MouseEvent) => handleHover(e, member)}
              onMouseLeave={() => handleUnHover()}
            >
              <circle r={dotRadius} className={styles.diagramMember} />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                className={styles.diagramMemberLabel}
              >
                {index}
              </text>
            </g>
          ))}
        </svg>
        <ul className={styles.clusterMembersLegend}>
          <li>
            <span
              className={styles.legendSwatchCenter}
              aria-hidden="true"
            ></span>
            Approximate cluster center
          </li>
          <li>
            <span
              className={styles.legendSwatchMember}
              aria-hidden="true"
            ></span>
            Individual parking feature (hover to highlight on the map)
          </li>
        </ul>
      </>
    );
  }

  function ClusterMembers({members}: {members: ClusterMember[]}) {
    if (members.length === 0) return null;
    return (
      <div className={styles.clusterMembers}>
        <h4 className={styles.clusterMembersTitle}>
          Cluster of {members.length} Parking Features
        </h4>
        {showClusterMembers && (
          <>
            <ClusterMembersDiagram members={members} />
            <div className={styles.clusterMembersList}>
              {members.map(({feature: member, linkedReports}, i) => (
                <ParkingFeatureDescription
                  key={member.id ?? i}
                  selected={false}
                  hovered={false}
                  feature={member}
                  handleClick={handleClick}
                  handleHover={handleHover}
                  handleUnHover={handleUnHover}
                  centerFeatureOnMap={centerFeatureOnMap}
                  onReportIssue={onReportIssue}
                  linkedReports={linkedReports}
                />
              ))}
            </div>
          </>
        )}
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
          {clusterMembers.length > 0 && (
            <SidebarButton
              onClick={() => setShowClusterMembers(!showClusterMembers)}
              aria-expanded={showClusterMembers ? 'true' : 'false'}
              umamiEvent={
                showClusterMembers
                  ? 'parking-feature-hide-cluster-members'
                  : 'parking-feature-show-cluster-members'
              }
            >
              {showClusterMembers ? 'Hide' : 'View'} Individual Parking Spots
              <img
                src={showClusterMembers ? chevronUp.src : chevronDown.src}
                alt=""
                style={{paddingLeft: 4}}
              />
            </SidebarButton>
          )}
        </div>
        <ClusterMembers members={clusterMembers} />
        <AllData feature={feature} />
      </div>
      <div className={styles.divider}></div>
    </>
  );
}
