import React, {useEffect, useRef, ComponentProps} from 'react';
import {Marker, useMap} from 'react-leaflet';
import {Popup as LeafletPopup} from 'leaflet';

export type MapMarkerProps = {
  id: string;
  focused: boolean;
  iconUrl?: string;
} & ComponentProps<typeof Marker>;

export function MapMarker({
  id,
  focused,
  position,
  iconUrl = undefined,
  children,
  ...others
}: MapMarkerProps) {
  // popupRef for calling openPopup() upon focus change
  // `Popup` from 'react-leaflet' forwards `Popup` from 'leaflet'
  const popupRef = useRef<LeafletPopup>(null);

  const map = useMap();

  useEffect(() => {
    if (!focused) return;
    map.flyTo(position, 18, {duration: 0.5});
    /* put openPopup to the end of the event loop job queue so openPopup() is queued after all the calls flyTo() triggers
     i.e. this minimize the chance of popup from opening during the flyTo() changes
     also map.openPopup() works most of the time while marker.openPopup() does not
    */
    setTimeout(() => {
      if (popupRef.current !== null) {
        map.openPopup(popupRef.current);
      }
    }, 0);
  }, [focused, position]);

  return (
    <Marker position={position} {...others}>
      {children}
    </Marker>
  );
}
