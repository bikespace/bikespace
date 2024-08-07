import React from 'react';
import {Map} from '../common/map';

import * as styles from './parking-map.module.scss';

export const ParkingMap = () => {
  return <Map className={styles.parkingMapPage} markers={[]} />;
};
