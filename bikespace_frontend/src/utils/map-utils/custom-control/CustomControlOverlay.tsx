import {ReactElement, cloneElement, memo} from 'react';
import {createPortal} from 'react-dom';

import {useControl} from 'react-map-gl';

import type {ControlPosition, IControl, Map} from 'maplibre-gl';

type Config = {
  position: ControlPosition;
  redraw?: () => void;
};

type OverlayProps = {
  position: ControlPosition;
  children: ReactElement;
};

class OverlayControl implements IControl {
  _map: Map | null = null;
  _container: HTMLElement | null = null;
  _position: ControlPosition = 'bottom-right';
  _redraw?: () => void;

  constructor({position, redraw}: Config) {
    this._position = position;
    if (redraw !== undefined) this._redraw = redraw;
  }

  onAdd(map: Map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';

    if (this._redraw !== undefined) {
      map.on('move', this._redraw);
      this._redraw();
    }

    return this._container;
  }

  onRemove() {
    if (this._map === null || this._container === null) return;
    this._container.remove();
    if (this._redraw !== undefined) this._map.off('move', this._redraw);
    this._map = null;
  }

  getDefaultPosition?() {
    return this._position;
  }

  getMap() {
    return this._map;
  }

  getElement() {
    return this._container;
  }
}

export function CustomControlOverlay({position, children}: OverlayProps) {
  const ctrl = useControl<OverlayControl>(() => {
    return new OverlayControl({position});
  });

  const map = ctrl.getMap();
  const elem = ctrl.getElement();
  if (map === null || elem === null) return;

  return createPortal(cloneElement(children, {map}), elem);
}
