import React from 'react';
import {useState} from 'react';

import {CustomControlOverlay} from '@/utils/map-utils';

import layersIcon from '@/assets/icons/layers.svg';
import closeIcon from '@/assets/icons/close-menu.svg';

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
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // TODOs:
  // add a click away effect on map to close
  // move the styles to a scss file
  // figure out how to add some info so people can tell the freshness of the imagery
  // decide whether to integrate with sidebar (and add in layer control for bike network) or whether to keep as a map menu

  return (
    <CustomControlOverlay position="top-left">
      <fieldset style={{margin: isOpen ? 4 : 0}}>
        <legend
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 4,
            fontSize: '0.9rem',
            marginLeft: isOpen ? 4 : 0,
          }}
        >
          {isOpen ? <div>Base Map:</div> : null}
          <button
            style={{
              minHeight: 29,
              minWidth: 29,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => setIsOpen(!isOpen)}
          >
            <img
              src={isOpen ? closeIcon.src : layersIcon.src}
              alt={`${isOpen ? 'Close' : 'Open'} Layers Menu`}
              style={isOpen ? {height: 14, width: 14} : {height: 20, width: 20}}
            />
          </button>
        </legend>
        {isOpen
          ? layerOptions.map(layer => (
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
                <label style={{fontSize: '0.9rem'}} htmlFor={layer.id}>
                  {layer.name}
                </label>
              </div>
            ))
          : null}
      </fieldset>
    </CustomControlOverlay>
  );
}
