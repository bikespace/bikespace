import React from 'react';

import {CustomControlOverlay} from '@/utils/map-utils';

export interface BaseMapOption {
  id: string;
  name: string;
  component: React.JSX.Element | null;
}

interface BasemapControlProps {
  layerOptions: BaseMapOption[];
  selectedLayer: string | undefined;
  setSelectedLayer: React.Dispatch<React.SetStateAction<string>>;
}

export function BasemapControl({
  layerOptions,
  selectedLayer,
  setSelectedLayer,
}: BasemapControlProps) {
  return (
    <CustomControlOverlay position="bottom-left">
      <div style={{padding: 4}}>
        <fieldset>
          <legend>Basemap:</legend>
          {layerOptions.map(layer => (
            <div key={layer.id}>
              <input
                type="radio"
                id={layer.id}
                name={layer.name}
                checked={selectedLayer?.includes(layer.id)}
                onChange={e => {
                  if (e.target.checked) {
                    setSelectedLayer(layer.id);
                  } else {
                    setSelectedLayer(layerOptions[0].id);
                  }
                }}
              />
              <label htmlFor={layer.id}>{layer.name}</label>
            </div>
          ))}
        </fieldset>
      </div>
    </CustomControlOverlay>
  );
}
