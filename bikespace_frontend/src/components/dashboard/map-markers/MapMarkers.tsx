import React, {useEffect} from 'react';
import useSupercluster from 'use-supercluster';
import Supercluster, {ClusterProperties} from 'supercluster';
import {useWindowSize} from '@uidotdev/usehooks';
import {useMap} from 'react-map-gl';
import {BBox} from 'geojson';

import {SubmissionApiPayload} from '@/interfaces/Submission';

import {useSubmissionId} from '@/states/url-params';

import {MapMarker} from '../map-marker';
import {MapClusterMarker} from '../map-cluster-marker';

interface MapMarkersProps {
  submissions: SubmissionApiPayload[];
  zoom: number;
}

export function MapMarkers({submissions, zoom}: MapMarkersProps) {
  const windowSize = useWindowSize();
  const map = useMap();

  const [focus] = useSubmissionId();

  useEffect(() => {
    if (!focus) return;

    const submission = submissions.find(submission => submission.id === focus);

    if (!submission) return;

    map.current?.flyTo({
      center: [submission.longitude, submission.latitude],
    });
    map.current?.zoomTo(16);
  }, [focus]);

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
    bounds: map.current?.getMap().getBounds().toArray().flat() as BBox,
    zoom,
    options: {maxZoom: 20},
  });

  return (
    <>
      {clusters.map(cluster => {
        const [longitude, latitude] = cluster.geometry.coordinates;

        const {cluster: isCluster, point_count: pointCount} =
          cluster.properties as ClusterProperties;

        return isCluster ? (
          <MapClusterMarker
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
