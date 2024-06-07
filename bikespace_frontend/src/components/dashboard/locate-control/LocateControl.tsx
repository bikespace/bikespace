import {createControlComponent} from '@react-leaflet/core';
import * as L from 'leaflet';
import 'leaflet.locatecontrol';
import 'leaflet.locatecontrol/dist/L.Control.Locate.css';

const {Locate} = L.Control;

interface P extends L.ControlOptions {}

function createLocateInstance(props: P) {
  const instance = new Locate(props);

  return instance;
}

export const LocateControl = createControlComponent(createLocateInstance);
