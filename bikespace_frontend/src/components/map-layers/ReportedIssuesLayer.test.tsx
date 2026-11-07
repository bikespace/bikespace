import React from 'react';
import {render} from '@testing-library/react';

import {ReportedIssuesLayer} from './ReportedIssuesLayer';

import type {FeatureCollection} from 'geojson';

let lastLayerProps: {filter?: unknown} | null = null;

jest.mock('react-map-gl/maplibre', () => ({
  Source: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Layer: (props: {filter?: unknown}) => {
    lastLayerProps = props;
    return null;
  },
}));

const reportedFeatures: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {reportCount: 1, bicycle_parking: 'rack'},
      geometry: {type: 'Point', coordinates: [-79.4, 43.66]},
    },
  ],
};

describe('ReportedIssuesLayer', () => {
  beforeEach(() => {
    lastLayerProps = null;
  });

  test('applies the given layerFilter to the underlying map layer', () => {
    const filter: ['==', ['get', 'bicycle_parking'], 'rack'] = [
      '==',
      ['get', 'bicycle_parking'],
      'rack',
    ];
    render(
      <ReportedIssuesLayer
        reportedFeatures={reportedFeatures}
        layerFilter={filter}
      />
    );
    expect(lastLayerProps?.filter).toEqual(filter);
  });

  test('defaults to no filtering (true) when layerFilter is not provided', () => {
    render(<ReportedIssuesLayer reportedFeatures={reportedFeatures} />);
    expect(lastLayerProps?.filter).toBe(true);
  });
});
