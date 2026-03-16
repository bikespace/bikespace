import {Protocol} from 'pmtiles';
import maplibregl from 'maplibre-gl';

export function addPMTilesProtocol() {
  const protocol = new Protocol();
  maplibregl.addProtocol('pmtiles', protocol.tile);
  return () => {
    maplibregl.removeProtocol('pmtiles');
  };
}
