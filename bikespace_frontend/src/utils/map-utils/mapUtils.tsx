import {StaticImageData} from 'next/image';
import React, {ReactElement} from 'react';
import {centroid} from '@turf/centroid';

import type {Feature, Position} from 'geojson';

/**
 * Returns a single [lon, lat] Point from a GeoJSON Feature using TurfJS
 * @param feature - LineString or Point feature
 * @returns [lon, lat] Position
 */
export function getCentroid(feature: Feature) {
  return centroid(feature).geometry.coordinates as Position;
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
  const [spriteName] = layoutOptions['icon-image'].split(':').slice(-1);
  const properties = spriteJSON[spriteName] as spriteProperties;
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

export class BBox {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;

  constructor(xmin: number, ymin: number, xmax: number, ymax: number) {
    this.xmin = xmin;
    this.ymin = ymin;
    this.xmax = xmax;
    this.ymax = ymax;
  }
  getURLParams() {
    return `${this.xmin},${this.ymin},${this.xmax},${this.ymax}`;
  }
}

export const torontoBBox = new BBox(
  -79.6392832,
  43.5796082,
  -79.1132193,
  43.8554425
);
