import React from 'react';

import {Layer, Source} from 'react-map-gl/maplibre';

export const COTAerialNightLayer = ({beforeId}: {beforeId: string}) => (
  <Source
    id="cot-aerial-night"
    type="raster"
    tiles={[
      'https://gis.toronto.ca/arcgis/rest/services/basemap/cot_2020_NightTimeLight_20cm/MapServer/tile/{z}/{y}/{x}',
    ]}
    tileSize={256}
    attribution="City of Toronto"
  >
    <Layer
      beforeId={beforeId}
      id="cot-aerial-night"
      type="raster"
      source="cot-aerial-night"
    />
  </Source>
);

export const COTAerialLatestLayer = ({beforeId}: {beforeId: string}) => (
  <Source
    id="cot-aerial-latest"
    type="raster"
    tiles={[
      'https://gis.toronto.ca/arcgis/rest/services/basemap/cot_ortho/MapServer/tile/{z}/{y}/{x}',
    ]}
    tileSize={256}
    attribution="City of Toronto"
  >
    <Layer
      beforeId={beforeId}
      id="cot-aerial-latest"
      type="raster"
      source="cot-aerial-latest"
    />
  </Source>
);
