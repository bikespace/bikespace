import {useState, useEffect} from 'react';
import {
  MapOptions,
  Map as M,
  GeolocateControl,
  ScaleControl,
} from 'maplibre-gl';

import {SubmissionFeature} from '@/interfaces/Submission';

import {trackUmamiEvent} from '@/utils';

import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './dashboard-map.module.scss';

export interface DashboardMapProps {
  submissions: SubmissionFeature[];
}

const mapOptions: MapOptions = {
  container: 'map',
  center: [-79.376221, 43.733399], // starting positiong [lng, lat],
  zoom: 12,
  maxZoom: 16,
  style:
    'https://api.thunderforest.com/styles/atlas/style.json?apikey=66ccf6226ef54ef38a6b97fe0b0e5d2e',
};

export function DashboardMap({submissions}: DashboardMapProps) {
  const [map, setMap] = useState<M | null>();

  useEffect(() => {
    const m = new M(mapOptions);

    const scaleControl = new ScaleControl();
    const geolocateControl = new GeolocateControl({
      trackUserLocation: false,
    });

    geolocateControl.on('geolocate', e => {
      console.log(e);
      trackUmamiEvent('locationfound');
    });

    m.addControl(scaleControl);
    m.addControl(geolocateControl);

    setMap(m);
  }, []);

  useEffect(() => {
    if (!map) return;

    map.on('load', () => {
      map.addSource('submissions', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: submissions,
        },
        cluster: true,
        clusterMaxZoom: 16,
        clusterRadius: 50,
      });

      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'submissions',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            100,
            '#f1f075',
            750,
            '#f28cb1',
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            100,
            30,
            750,
            40,
          ],
        },
      });

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'submissions',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
      });

      map.addLayer({
        id: 'unclustered-point',
        type: 'symbol',
        source: 'submissions',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': [
            'case',
            ['<', ['get', 'mag'], 2],
            '1-icon',
            ['<', ['get', 'mag'], 3],
            '2-icon',
            ['<', ['get', 'mag'], 4],
            '3-icon',
            ['<', ['get', 'mag'], 5],
            '4-icon',
            ['<', ['get', 'mag'], 6],
            '5-icon',
            ['<', ['get', 'mag'], 7],
            '6-icon',
            ['<', ['get', 'mag'], 8],
            '7-icon',
            '0-icon',
          ],
          'icon-size': 0.6,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      });
    });
  }, [map]);

  return <div id="map" className={styles.map} />;

  // return (
  //   <MapGL
  //     ref={mapRef}
  //     {...viewState}
  //     attributionControl={false}
  //     style={{width: '100%', height: '100%'}}
  //     mapStyle="https://api.thunderforest.com/styles/atlas/style.json?apikey=66ccf6226ef54ef38a6b97fe0b0e5d2e"
  //     onZoomEnd={e => {
  //       setViewState(e.viewState);
  //     }}
  //     onMoveEnd={e => {
  //       setViewState(e.viewState);
  //     }}
  //   >
  //     <AttributionControl customAttribution='&copy; Maps <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; Data <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' />
  //     <GeolocateControl
  //       trackUserLocation={false}
  //       onGeolocate={position => {
  //         setViewState(state => ({
  //           ...state,
  //           longitude: position.coords.longitude,
  //           latitude: position.coords.latitude,
  //         }));

  //         trackUmamiEvent('locationfound');
  //       }}
  //       onError={e => {
  //         trackUmamiEvent('locationerror', {code: e.code, message: e.message});
  //       }}
  //       position="top-left"
  //     />
  //     <ScaleControl />
  //     <MapMarkers submissions={submissions} />
  //   </MapGL>
  // );
}
