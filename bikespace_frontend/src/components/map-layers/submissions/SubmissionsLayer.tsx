import React from 'react';
import {Layer, Marker, Source, useMap} from 'react-map-gl/maplibre';

import {getGeoJSONFromSubmissions, zoomAndEaseTo} from '@/utils/map-utils';

import {SubmissionApiPayload} from '@/interfaces/Submission';

import {
  clusteredSubmissionsLayer,
  clusterCountsSubmissionsLayer,
  unclusteredSubmissionsLayer,
  submissionsInteractiveLayers,
  submissionsInteractiveSource,
} from './_MapLayers';

import type {
  MapLayerMouseEvent,
  PointLike,
  MapGeoJSONFeature,
  GeoJSONSource,
  Point,
  MapRef,
} from 'react-map-gl/maplibre';
import type {QueryRenderedFeaturesOptions} from 'maplibre-gl';

interface SubmissionsLayerProps {
  submissions: SubmissionApiPayload[];
  singleSelected: MapGeoJSONFeature | null;
  multiSelected: MapGeoJSONFeature[] | null;
}

export function SubmissionsLayer({
  submissions,
  singleSelected,
  multiSelected,
}: SubmissionsLayerProps) {
  return (
    <>
      <Source
        id={submissionsInteractiveSource}
        type="geojson"
        data={getGeoJSONFromSubmissions(submissions)}
        cluster={true}
        clusterMaxZoom={20} // never drop clusters if points overlap
        clusterRadius={40} // default is 50
      >
        <Layer {...clusteredSubmissionsLayer} />
        <Layer {...clusterCountsSubmissionsLayer} />
        <Layer {...unclusteredSubmissionsLayer} />
      </Source>
    </>
  );
}

export async function handleMapClick(
  e: MapLayerMouseEvent,
  mapRef: React.RefObject<MapRef>,
  maxZoom = 20
): Promise<{
  singleSelected: MapGeoJSONFeature | null;
  multiSelected: MapGeoJSONFeature[] | null;
}> {
  const interactiveSource: GeoJSONSource = mapRef.current!.getSource(
    submissionsInteractiveSource
  )!;

  const features = mapRef.current!.queryRenderedFeatures(
    e.point as PointLike,
    {
      layers: submissionsInteractiveLayers,
    } as QueryRenderedFeaturesOptions
  );

  const clusterFeatures = features.filter(
    feature => feature.properties?.cluster
  );
  const markerFeatures = features.filter(
    feature => !feature.properties?.cluster
  );

  // zoom in to reveal more detail if cluster is selected
  if (clusterFeatures.length > 0) {
    const firstCluster = clusterFeatures[0];
    const zoom = await interactiveSource.getClusterExpansionZoom(
      firstCluster.properties.cluster_id
    );
    zoomAndEaseTo(clusterFeatures, mapRef, zoom.valueOf());
    // mapRef.current!.easeTo({
    //   // @ts-expect-error: unable to narrow MapGeoJSONFeature coordinates type
    //   center: firstCluster.geometry.coordinates,
    //   zoom,
    //   duration: 500,
    // });

    // return features in cluster as multiSelected if max zoom has been reached
    if (zoom === maxZoom) {
      const featuresInCluster = await interactiveSource.getClusterChildren(
        firstCluster.properties.cluster_id
      );
      return {
        singleSelected: null,
        multiSelected: featuresInCluster as MapGeoJSONFeature[],
      };
    } else {
      return {
        singleSelected: null,
        multiSelected: null,
      };
    }
  }

  // select feature(s) if only marker(s) are selected
  if (clusterFeatures.length === 0 && markerFeatures.length > 0) {
    zoomAndEaseTo(markerFeatures, mapRef);
    // const firstMarker = markerFeatures[0];
    // mapRef.current!.easeTo({
    //   // @ts-expect-error: unable to narrow MapGeoJSONFeature coordinates type
    //   center: firstMarker.geometry.coordinates,
    //   zoom: 18,
    //   duration: 500,
    // });
    return {
      singleSelected: markerFeatures.length === 1 ? markerFeatures[0] : null,
      multiSelected: markerFeatures.length > 1 ? markerFeatures : null,
    };
  }

  // Handle map canvas click (!features.length)
  return {
    singleSelected: null,
    multiSelected: null,
  };
}

// show map pins as interactive when mouse is over them
export function handleMouseHover(mapRef: React.RefObject<MapRef>) {
  for (const layer of submissionsInteractiveLayers) {
    mapRef.current!.on('mouseenter', layer, () => {
      mapRef.current!.getCanvas().style.cursor = 'pointer';
    });
    mapRef.current!.on('mouseleave', layer, () => {
      mapRef.current!.getCanvas().style.cursor = '';
    });
  }
}
