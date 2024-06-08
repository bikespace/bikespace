import {createPathComponent} from '@react-leaflet/core';
import L, {
  type LayerOptions,
  type PolylineOptions,
  type Icon,
  type Point,
  type DivIcon,
  type Marker,
  type FitBoundsOptions,
  type LatLngBounds,
  type LeafletEventHandlerFn,
} from 'leaflet';
import 'leaflet.markercluster';
import type {PropsWithChildren} from 'react';

export interface MarkerCluster extends Marker {
  /*
   * Recursively retrieve all child markers of this cluster.
   */
  getAllChildMarkers(): Marker[];

  /*
   * Returns the count of how many child markers we have.
   */
  getChildCount(): number;

  /*
   * Zoom to the minimum of showing all of the child markers, or the extents of this cluster.
   */
  zoomToBounds(options?: FitBoundsOptions): void;

  /*
   * Returns the cluster bounds.
   */
  getBounds(): LatLngBounds;

  /*
   * Spiderfies the child markers of this cluster.
   */
  spiderfy(): void;

  /*
   * Unspiderfies a cluster (opposite of spiderfy).
   */
  unspiderfy(): void;
}

export interface MarkerClusterGroupOptions extends LayerOptions {
  /*
   * The maximum radius that a cluster will cover from the central marker (in pixels). Default 80.
   * Decreasing will make more, smaller clusters. You can also use a function that accepts
   * the current map zoom and returns the maximum cluster radius in pixels
   */
  maxClusterRadius?: number | ((zoom: number) => number) | undefined;

  /*
   * Function used to create the cluster icon
   */
  iconCreateFunction?: ((cluster: MarkerCluster) => Icon | DivIcon) | undefined;

  /*
   * Map pane where the cluster icons will be added.
   * Defaults to L.Marker's default (currently 'markerPane')
   */
  clusterPane?: string | undefined;

  /*
   * When you click a cluster at any zoom level we spiderfy it
   * so you can see all of its markers.
   */
  spiderfyOnEveryZoom?: boolean | undefined;

  /*
   * When you click a cluster at the bottom zoom level we spiderfy it
   * so you can see all of its markers.
   */
  spiderfyOnMaxZoom?: boolean | undefined;

  /*
   * When you mouse over a cluster it shows the bounds of its markers.
   */
  showCoverageOnHover?: boolean | undefined;

  /*
   * When you click a cluster we zoom to its bounds.
   */
  zoomToBoundsOnClick?: boolean | undefined;

  /*
   * If set to true, overrides the icon for all added markers to make them appear as a 1 size cluster.
   */
  singleMarkerMode?: boolean | undefined;

  /*
   * If set, at this zoom level and below markers will not be clustered. This defaults to disabled.
   */
  disableClusteringAtZoom?: number | undefined;

  /*
   * Clusters and markers too far from the viewport are removed from the map
   * for performance.
   */
  removeOutsideVisibleBounds?: boolean | undefined;

  /*
   * Smoothly split / merge cluster children when zooming and spiderfying.
   * If L.DomUtil.TRANSITION is false, this option has no effect (no animation is possible).
   */
  animate?: boolean | undefined;

  /*
   * If set to true (and animate option is also true) then adding individual markers to the
   * MarkerClusterGroup after it has been added to the map will add the marker and animate it
   * into the cluster. Defaults to false as this gives better performance when bulk adding markers.
   * addLayers does not support this, only addLayer with individual Markers.
   */
  animateAddingMarkers?: boolean | undefined;

  /*
   * Custom function to calculate spiderfy shape positions
   */
  spiderfyShapePositions?:
    | ((count: number, centerPoint: Point) => Point[])
    | undefined;

  /*
   * Increase from 1 to increase the distance away from the center that spiderfied markers are placed.
   * Use if you are using big marker icons (Default: 1).
   */
  spiderfyDistanceMultiplier?: number | undefined;

  /*
   * Allows you to specify PolylineOptions to style spider legs.
   * By default, they are { weight: 1.5, color: '#222', opacity: 0.5 }.
   */
  spiderLegPolylineOptions?: PolylineOptions | undefined;

  /*
   * Boolean to split the addLayers processing in to small intervals so that the page does not freeze.
   */
  chunkedLoading?: boolean | undefined;

  /*
   * Time delay (in ms) between consecutive periods of processing for addLayers. Default to 50ms.
   */
  chunkDelay?: number | undefined;

  /*
   * Time interval (in ms) during which addLayers works before pausing to let the rest of the page process.
   * In particular, this prevents the page from freezing while adding a lot of markers. Defaults to 200ms.
   */
  chunkInterval?: number | undefined;

  /*
   * Callback function that is called at the end of each chunkInterval.
   * Typically used to implement a progress indicator. Defaults to null.
   */
  chunkProgress?:
    | ((
        processedMarkers: number,
        totalMarkers: number,
        elapsedTime: number
      ) => void)
    | undefined;

  /*
   * Options to pass when creating the L.Polygon(points, options) to show the bounds of a cluster.
   * Defaults to empty
   */
  polygonOptions?: PolylineOptions | undefined;
}

type Props = PropsWithChildren<MarkerClusterGroupOptions>;

export const LeafletMarkerClusterGroup = createPathComponent<
  L.MarkerClusterGroup,
  Props
>((props, ctx) => {
  const clusterProps: Record<string, LeafletEventHandlerFn> = {};
  const clusterEvents: Record<string, LeafletEventHandlerFn> = {};

  // Splitting props and events to different objects
  Object.entries(props).forEach(([propName, prop]) =>
    propName.startsWith('on')
      ? (clusterEvents[propName] = prop)
      : (clusterProps[propName] = prop)
  );

  // Creating markerClusterGroup Leaflet element
  const markerClusterGroup = L.markerClusterGroup(
    clusterProps as MarkerClusterGroupOptions
  );

  // Initializing event listeners
  Object.entries(clusterEvents).forEach(([eventAsProp, callback]) => {
    const clusterEvent = `cluster${eventAsProp.substring(2).toLowerCase()}`;
    markerClusterGroup.on(clusterEvent, callback);
  });

  return {
    instance: markerClusterGroup,
    context: {...ctx, layerContainer: markerClusterGroup},
  };
});
