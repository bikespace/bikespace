import {StaticImageData} from 'next/image';
import React, {ReactElement} from 'react';

import {MapGeoJSONFeature} from 'maplibre-gl';
import type {LineString, Point} from 'geojson';

/**
 * Returns a single [lon, lat] Point from a Maplibre MapGeoJSONFeature
 * @param feature - LineString or Point feature
 * @returns [lon, lat] Point
 */
export function getCentroid(feature: MapGeoJSONFeature) {
  if (feature.geometry.type === 'LineString') {
    const geometry = feature.geometry as LineString;
    return geometry.coordinates[0];
  }
  if (feature.geometry.type === 'Point') {
    const geometry = feature.geometry as Point;
    return geometry.coordinates;
  }
  throw new Error(
    `Error in getCentroid function: unhandled geometry type ${feature.geometry.type}`
  );
}

interface spriteProperties {
  height: number;
  pixelRatio: number;
  width: number;
  x: number;
  y: number;
}

interface layoutOptionsIcon {
  'icon-image': string;
  'icon-size': number;
}

interface layoutOptionsText {
  'text-field': string;
  'text-size': number;
  'text-anchor': 'top' | 'bottom';
  'text-offset': [number, number];
  'text-font': string[];
}

export interface layoutOptions extends layoutOptionsIcon, layoutOptionsText {}

export function getSpriteImage(
  spriteImage: StaticImageData,
  spriteJSON: {[key: string]: spriteProperties},
  layoutOptions: layoutOptionsIcon,
  altText: string
): ReactElement {
  const properties = spriteJSON[
    layoutOptions['icon-image']
  ] as spriteProperties;
  const iconSize = layoutOptions['icon-size'];

  return (
    <div
      role={altText === '' ? 'presentation' : 'img'}
      aria-label={altText === '' ? undefined : altText}
      style={{
        background: `url(${spriteImage.src}) -${
          (properties.x * iconSize) / properties.pixelRatio
        }px -${(properties.y * iconSize) / properties.pixelRatio}px no-repeat`,
        backgroundSize: `${
          (spriteImage.width * iconSize) / properties.pixelRatio
        }px ${(spriteImage.height * iconSize) / properties.pixelRatio}px`,
        display: 'inline-block',
        height: `${(properties.height * iconSize) / properties.pixelRatio}px`,
        width: `${(properties.width * iconSize) / properties.pixelRatio}px`,
      }}
    ></div>
  );
}

export function getSpriteImageWithTextOverlay(
  spriteImage: StaticImageData,
  spriteJSON: {[key: string]: spriteProperties},
  layoutOptions: layoutOptions,
  altText: string
): ReactElement {
  const [w, h] = layoutOptions['text-offset'];
  const textSize = layoutOptions['text-size'];

  return (
    <div style={{position: 'relative'}}>
      {getSpriteImage(spriteImage, spriteJSON, layoutOptions, altText)}
      <div
        style={{
          position: 'absolute',
          fontSize: textSize,
          fontFamily: layoutOptions['text-font'].join(', '),
          ...(layoutOptions['text-anchor'] === 'top'
            ? {top: -h * textSize * 0.9}
            : {bottom: -h * textSize * 0.9}),
          left: 0,
          right: 0,
          textAlign: 'center',
        }}
      >
        {layoutOptions['text-field']}
      </div>
    </div>
  );
}
