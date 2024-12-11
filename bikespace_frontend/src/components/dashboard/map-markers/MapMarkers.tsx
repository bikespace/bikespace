import React, {useEffect, useState} from 'react';
import useSupercluster from 'use-supercluster';
import Supercluster, {ClusterProperties} from 'supercluster';
import {useWindowSize} from '@uidotdev/usehooks';
import {useMap} from 'react-map-gl';

import {SubmissionApiPayload} from '@/interfaces/Submission';
import {Viewport} from '../map/Map';

import {useSubmissionId} from '@/states/url-params';

import {MapMarker} from '../map-marker';
import {MapMarkerCluster} from '../map-marker-cluster';

interface MapMarkersProps {
  submissions: SubmissionApiPayload[];
  viewport: Viewport;
}

export function MapMarkers({submissions, viewport}: MapMarkersProps) {
  const windowSize = useWindowSize();
  const map = useMap();

  const [focus] = useSubmissionId();

  const [submission, setSubmission] = useState<
    SubmissionApiPayload | undefined
  >();

  const {clusters, supercluster} = useSupercluster({
    points: submissions.map(submission => ({
      type: 'Feature',
      properties: {
        ...submission,
        cluster: false,
      },
      geometry: {
        type: 'Point',
        coordinates: [submission.longitude, submission.latitude],
      },
    })),
    bounds: viewport.bounds,
    zoom: viewport.zoom,
  });

  useEffect(() => {
    setSubmission(
      focus
        ? submissions.find(submission => submission.id === focus)
        : undefined
    );
  }, [focus, submissions]);

  useEffect(() => {
    if (!submission) return;

    map.current?.flyTo({
      center: [submission.longitude, submission.latitude],
      zoom: 16,
    });
  }, [submission]);

  useEffect(() => {
    if (!submission || !supercluster) return;

    if (clusters.length === 0) {
      map.current?.zoomTo(16);
      return;
    }

    const cluster = clusters
      .filter(c => c.properties.cluster)
      .find(c =>
        supercluster
          ?.getLeaves(c.id as number)
          .find(l => l.properties.id === submission.id)
      );

    if (!cluster) return;

    const zoom = cluster
      ? supercluster.getClusterExpansionZoom(cluster.id as number)
      : 16;

    map.current?.flyTo({
      center: [submission.longitude, submission.latitude],
      zoom,
    });
  }, [submission, clusters, supercluster]);

  return (
    <>
      {clusters.map(cluster => {
        const [longitude, latitude] = cluster.geometry.coordinates;

        const {cluster: isCluster, point_count: pointCount} =
          cluster.properties as ClusterProperties;

        return isCluster ? (
          <MapMarkerCluster
            key={cluster.id}
            id={cluster.id as number}
            latitude={latitude}
            longitude={longitude}
            count={pointCount}
            totalCount={submissions.length}
            supercluster={supercluster as Supercluster}
          />
        ) : (
          <MapMarker
            key={cluster.properties.id}
            submission={cluster.properties as SubmissionApiPayload}
            windowWidth={windowSize.width}
          />
        );
      })}
    </>
  );
}
