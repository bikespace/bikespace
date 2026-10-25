import React from 'react';

import {Layer, Source} from 'react-map-gl/maplibre';

import {attributions} from '@/utils/map-utils';

export const COTAerialNightLayer = ({beforeId}: {beforeId: string}) => (
  <Source
    id="cot-aerial-night"
    type="raster"
    tiles={[
      'https://gis.toronto.ca/arcgis/rest/services/basemap/cot_2020_NightTimeLight_20cm/MapServer/tile/{z}/{y}/{x}',
    ]}
    tileSize={256}
    attribution={attributions['City of Toronto Open Data']}
  >
    <Layer
      beforeId={beforeId}
      id="cot-aerial-night"
      type="raster"
      source="cot-aerial-night"
    />
    <Layer
      beforeId={'cot-aerial-night'}
      type="background"
      paint={{'background-color': 'black'}}
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
    attribution={attributions['City of Toronto Open Data']}
  >
    <Layer
      beforeId={beforeId}
      id="cot-aerial-latest"
      type="raster"
      source="cot-aerial-latest"
    />
    <Layer
      beforeId={'cot-aerial-latest'}
      type="background"
      paint={{'background-color': 'black'}}
    />
  </Source>
);
