'use client';
import {useMemo} from 'react';
import {Layer, Source} from 'react-map-gl/maplibre';
import type {StolenBikeReport} from '@/interfaces/BikeTheftProperties';
import {
  BIKE_THEFT_SOURCE_ID,
  BIKE_THEFT_SELECTED_SOURCE_ID,
  stolenPinsLayer,
  stolenPinsHitLayer,
  stolenPinsSelectedLayer,
  BIKE_THEFT_COUNTS_SOURCE_ID,
  stolenCountsLayer,
  BIKE_THEFT_CLUSTER_MAX_ZOOM,
  stolenClustersLayer,
  stolenClusterCountsLayer,
} from './constants';

// --- GeoJSON helpers ---
function reportsToGeoJSON(reports: StolenBikeReport[]) {
  const locationStatuses = new Map<string, Set<string>>();
  for (const report of reports) {
    const key = JSON.stringify([report.longitude, report.latitude]);
    const statuses = locationStatuses.get(key) ?? new Set<string>();
    statuses.add(report.status);
    locationStatuses.set(key, statuses);
  }
  // Function to check if a location has both 'stolen' and 'recovered' reports
  function locationStatus(report: StolenBikeReport) {
    const statuses = locationStatuses.get(
      JSON.stringify([report.longitude, report.latitude])
    )!;
    return (statuses.has('stolen') || statuses.has('unknown')) &&
      statuses.has('recovered')
      ? 'mixed'
      : statuses.has('stolen') && statuses.has('unknown')
        ? 'stolen'
        : report.status;
  }

  return {
    type: 'FeatureCollection' as const,
    features: reports.map(r => ({
      type: 'Feature' as const,
      properties: {
        id: r.id,
        date: r.date,
        location: r.location,
        bikeType: r.bikeType,
        color: r.color,
        description: r.description,
        status: r.status,
        locationStatus: locationStatus(r),
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [r.longitude, r.latitude],
      },
    })),
  };
}

interface BikeTheftLayerProps {
  reports: StolenBikeReport[];
  selectedReports: StolenBikeReport[];
  beforeId?: string;
}

export function BikeTheftLayer({
  reports,
  selectedReports,
  beforeId,
}: BikeTheftLayerProps) {
  const allPinsGeoJSON = useMemo(() => reportsToGeoJSON(reports), [reports]);
  const selectedPinGeoJSON = reportsToGeoJSON(selectedReports);
  const countsGeoJSON = useMemo(() => {
    const locations = new Map<
      string,
      {longitude: number; latitude: number; count: number}
    >();
    for (const report of reports) {
      const key = JSON.stringify([report.longitude, report.latitude]);
      const location = locations.get(key);
      if (location) {
        location.count += 1;
      } else {
        locations.set(key, {
          longitude: report.longitude,
          latitude: report.latitude,
          count: 1,
        });
      }
    }
    return {
      type: 'FeatureCollection' as const,
      features: Array.from(locations.values())
        .filter(location => location.count > 1)
        .map(location => ({
          type: 'Feature' as const,
          properties: {count: location.count},
          geometry: {
            type: 'Point' as const,
            coordinates: [location.longitude, location.latitude],
          },
        })),
    };
  }, [reports]);
  return (
    <>
      {/* All report pins */}
      <Source
        id={BIKE_THEFT_SOURCE_ID}
        type="geojson"
        data={allPinsGeoJSON}
        cluster
        clusterRadius={40}
        clusterMaxZoom={BIKE_THEFT_CLUSTER_MAX_ZOOM}
        clusterProperties={{
          recoveredCount: [
            '+',
            ['case', ['==', ['get', 'status'], 'recovered'], 1, 0],
            ['case', ['==', ['get', 'status'], 'unknown'], 1, 0],
          ],
          stolenCount: [
            '+',
            ['case', ['==', ['get', 'status'], 'stolen'], 1, 0],
            ['case', ['==', ['get', 'status'], 'unknown'], 1, 0],
          ],
        }}
      >
        <Layer {...stolenClustersLayer} beforeId={beforeId} />
        <Layer {...stolenClusterCountsLayer} />
        <Layer {...stolenPinsLayer} beforeId={beforeId} />
        <Layer {...stolenPinsHitLayer} />
      </Source>

      {/* Selected pin highlight */}
      {selectedReports.length > 0 ? (
        <Source
          id={BIKE_THEFT_SELECTED_SOURCE_ID}
          type="geojson"
          data={selectedPinGeoJSON}
        >
          <Layer {...stolenPinsSelectedLayer} beforeId={beforeId} />
        </Source>
      ) : null}
      <Source
        id={BIKE_THEFT_COUNTS_SOURCE_ID}
        type="geojson"
        data={countsGeoJSON}
      >
        <Layer {...stolenCountsLayer} />
      </Source>
    </>
  );
}
