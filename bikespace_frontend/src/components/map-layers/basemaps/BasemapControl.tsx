import React from 'react';

import {Layer, Source} from 'react-map-gl/maplibre';

import {CustomControlOverlay} from '@/utils/map-utils';

interface BasemapControlProps {
  selectedLayer: 'cot-aerial' | 'cot-aerial-night' | 'maptiler-streets';
  setSelectedLayer: React.Dispatch<React.SetStateAction<string>>;
}

export function BasemapControl({
  selectedLayer,
  setSelectedLayer,
}: BasemapControlProps) {
  return (
    <CustomControlOverlay position="bottom-left">
      <div style={{padding: 4}}>Hello World</div>
    </CustomControlOverlay>
  );
}
