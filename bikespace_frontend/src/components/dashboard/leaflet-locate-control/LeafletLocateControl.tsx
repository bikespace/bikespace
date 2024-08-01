import {createControlComponent} from '@react-leaflet/core';
import 'leaflet.locatecontrol';
import {Control} from 'leaflet';

function createLocateInstance(props: L.ControlOptions) {
  const instance = new Control.Locate(props);

  return instance;
}

export const LeafletLocateControl =
  createControlComponent(createLocateInstance);
