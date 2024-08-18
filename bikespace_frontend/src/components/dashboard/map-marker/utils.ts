import {Map, LatLngTuple, Popup} from 'leaflet';

interface FlyToMarkerOptions {
  duration: number; // in seconds
  zoom: number;
}

export const flyToMarker = (
  map: Map,
  position: LatLngTuple,
  {zoom, duration}: FlyToMarkerOptions
) => {
  map.flyTo(position, zoom, {duration});
};

interface OpenPopupOptions {
  duration: number;
}

export const openMarkerPopup = (
  map: Map,
  popupRef: React.RefObject<Popup>,
  {duration}: OpenPopupOptions
) => {
  // put openPopup to the end of the event loop job queue so openPopup()
  // is queued after all the calls flyTo() triggers
  // i.e. this minimize the chance of popup from opening during the flyTo() changes
  // also map.openPopup() works most of the time while marker.openPopup() does not
  setTimeout(() => {
    if (!popupRef.current) return;

    map.openPopup(popupRef.current);
  }, duration);
};
