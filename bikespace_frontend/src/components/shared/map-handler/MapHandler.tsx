import {LeafletMouseEventHandlerFn} from 'leaflet';
import {useMapEvent} from 'react-leaflet';

interface MapHandlerProps {
  onClick: LeafletMouseEventHandlerFn;
}

export const MapHandler = ({onClick}: MapHandlerProps) => {
  useMapEvent('click', onClick);

  return null;
};
