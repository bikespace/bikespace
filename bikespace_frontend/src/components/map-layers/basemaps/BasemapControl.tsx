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

interface BasemapOptionsListProps {
  layerOptions: BaseMapOption[];
  selectedLayer: string | undefined;
  setSelectedLayer: React.Dispatch<React.SetStateAction<string>>;
  inputName?: string;
}

export function BasemapOptionsList({
  layerOptions,
  selectedLayer,
  setSelectedLayer,
  inputName = 'basemap-options',
}: BasemapOptionsListProps) {
  return (
    <div className={styles.baseMapOptionsPicker}>
      {layerOptions.map(layer => {
        return (
          <div key={layer.id} className={styles.basemapOption}>
            <input
              type="radio"
              id={`${inputName}-${layer.id}`}
              name={inputName}
              checked={selectedLayer === layer.id}
              onChange={e => {
                if (e.target.checked) {
                  setSelectedLayer(layer.id);
                } else {
                  setSelectedLayer(layerOptions[0].id);
                }
              }}
            />
            <label
              className={styles.baseMapOptionLabel}
              htmlFor={`${inputName}-${layer.id}`}
            >
              {layer.name}
            </label>
          </div>
        );
      })}
    </div>
  );
}

export function BasemapMapControl({
  layerOptions,
  selectedLayer,
  setSelectedLayer,
}: BasemapOptionsListProps) {
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
          <BasemapOptionsList
            layerOptions={layerOptions}
            selectedLayer={selectedLayer}
            setSelectedLayer={setSelectedLayer}
          />
        ) : null}
      </fieldset>
    </CustomControlOverlay>
  );
}

export function BasemapMapButton({
  handleClick,
}: {
  handleClick: React.MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <CustomControlOverlay position="top-left">
      <button className={styles.openCloseButton} onClick={handleClick}>
        <img
          src={layersIcon.src}
          alt="Open Layers Menu"
          style={{height: 20, width: 20}}
        />
      </button>
    </CustomControlOverlay>
  );
}
