import React, {useEffect, useMemo, useState} from 'react';
import {Map} from '../common/map';

import * as styles from './parking-map.module.scss';

import {FeatureCollection, Point} from 'geojson';
import {MapMarkerProps} from '../common/map-marker/MapMarker';

const LAT_IDX = 1;
const LNG_IDX = 0;

const useGeoJSONMarkers = ({
  featureCollection,
}: {
  featureCollection: FeatureCollection<Point>;
}) => {
  const markers: MapMarkerProps[] = useMemo(() => {
    return featureCollection.features
      .filter(
        f =>
          f?.geometry?.coordinates[LAT_IDX] && f?.geometry?.coordinates[LNG_IDX]
      )
      .map((f, i) => ({
        position: [
          f.geometry.coordinates[LAT_IDX],
          f.geometry.coordinates[LNG_IDX],
        ],
        id: f.geometry.coordinates.join(',') + i,
        focused: false,
        markerType: 'GeoJSONFeature',
      }));
  }, [featureCollection]);
  return markers;
};

const EMPTY_COLLECTION: FeatureCollection<Point> = {
  type: 'FeatureCollection',
  features: [],
};

export const ParkingMap = () => {
  const [collection, setCollection] = useState(EMPTY_COLLECTION);
  useEffect(() => {
    fetch(
      'https://raw.githubusercontent.com/tallcoleman/new-parking-map/main/Display%20Files/all_sources.geojson'
    ).then(async data => {
      setCollection(await data.json());
    });
  }, [setCollection]);
  const parkingMarkers = useGeoJSONMarkers({featureCollection: collection});
  useEffect(() => {
    console.log('parking markers', parkingMarkers);
  }, [parkingMarkers]);
  return <Map className={styles.parkingMapPage} markers={parkingMarkers} />;
};
