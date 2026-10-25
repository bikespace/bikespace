import React from 'react';
import {useState} from 'react';

import {useClickAway} from '@uidotdev/usehooks';

import {CustomControlOverlay} from '@/utils/map-utils';

import type {StyleSpecification} from 'react-map-gl/maplibre';

import styles from './basemap-control.module.scss';

import layersIcon from '@/assets/icons/layers.svg';
import closeIcon from '@/assets/icons/close-menu.svg';

export interface MapStyleMeta {
  mapStyle: StyleSpecification;
  roadLabelLayer: string;
  satelliteRasterLayer: string | null;
}

export interface BaseMapOption {
  id: string;
  name: string;
  component: React.JSX.Element | null;
  style: MapStyleMeta;
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
  const clickAwayRef = useClickAway(() => {
    setIsOpen(false);
  }) as React.RefObject<HTMLFieldSetElement>;

  return (
    <CustomControlOverlay position="top-left">
      <fieldset ref={clickAwayRef} style={{margin: isOpen ? 4 : 0}}>
        <legend
          className={styles.controlHeader}
          style={{
            paddingLeft: isOpen ? 4 : 0,
          }}
        >
          {isOpen ? <h3>Base Map:</h3> : null}
          <button
            className={styles.openCloseButton}
            onClick={() => setIsOpen(!isOpen)}
          >
            <img
              src={isOpen ? closeIcon.src : layersIcon.src}
              alt={`${isOpen ? 'Close' : 'Open'} Layers Menu`}
              style={isOpen ? {height: 14, width: 14} : {height: 20, width: 20}}
            />
          </button>
        </legend>
        {isOpen ? (
          <div className={styles.baseMapOptionsPicker}>
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
                <label className={styles.baseMapOptionLabel} htmlFor={layer.id}>
                  {layer.name}
                </label>
              </div>
            ))}
          </div>
        ) : null}
      </fieldset>
    </CustomControlOverlay>
  );
}
