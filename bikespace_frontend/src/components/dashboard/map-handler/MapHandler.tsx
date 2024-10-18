import {useEffect} from 'react';
import {useMap} from 'react-leaflet';
import {useWindowSize} from '@uidotdev/usehooks';

import {trackUmamiEvent} from '@/utils';

import {useSubmissionId} from '@/states/url-params';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

export const MapHandler = () => {
  const map = useMap();

  const window = useWindowSize();

  const [focus] = useSubmissionId();

  useEffect(() => {
    if (focus === null) {
      map
        .locate()
        .on('locationfound', e => {
          trackUmamiEvent('locationfound');

          map.flyTo(e.latlng, map.getZoom());

          // Stop location tracking after location found
          map.stopLocate();
        })
        .on('locationerror', err => {
          const code = err.code as 0 | 1 | 2 | 3;

          const message =
            CUSTOM_GEO_ERROR_MESSAGES[code] ||
            'Unknown error while trying to locate you';

          trackUmamiEvent('locationerror', {code: err.code, message});
        });
    }
  }, []); // [] = run on first render only

  useEffect(() => {
    map.invalidateSize();
  }, [window, focus]);

  return null;
};

const CUSTOM_GEO_ERROR_MESSAGES = {
  // leaflet internally uses 0 to denote missing Geolocation API
  // ref: https://github.com/Leaflet/Leaflet/blob/00e0534cd9aa723d10a652146311efd9ce990b46/src/map/Map.js#L632
  0: 'GPS is not supported in your browser.',
  1: 'Please allow location access.',
  // happens when: location is disabled at OS-level / when GPS has other errors
  2: 'Had trouble locating you. Please turn on / restart your GPS or try another device.',
  3: 'It took too long to locate you. Please try again.',
};
