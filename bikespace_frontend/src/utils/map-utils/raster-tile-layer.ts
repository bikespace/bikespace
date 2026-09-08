export interface RasterTileLayerProps {
  attribution: string;
  url: string;
}

/**
 * Purpose: provide one raster basemap configuration for Bikespace's Leaflet maps.
 * Input: the build-time MapTiler API key; an empty or missing key means local fallback.
 * Output: MapTiler tiles with provider attribution when configured, otherwise OSM tiles.
 * Invariant: the returned attribution credits every tile-data provider in the URL.
 */
export function getRasterTileLayerProps(
  maptilerApiKey?: string
): RasterTileLayerProps {
  if (maptilerApiKey) {
    return {
      attribution:
        '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      url: `https://api.maptiler.com/maps/streets-v4/256/{z}/{x}/{y}.png?key=${maptilerApiKey}`,
    };
  }

  return {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  };
}
