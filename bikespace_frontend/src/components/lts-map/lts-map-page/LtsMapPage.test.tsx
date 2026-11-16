import React from 'react';
import {act, render, screen} from '@testing-library/react';
import {LtsMapPage} from './LtsMapPage';
import {useLtsDataLastModifiedQuery} from '@/hooks/use-lts-data-last-modified-query';

jest.mock('@/hooks/use-lts-data-last-modified-query', () => ({
  useLtsDataLastModifiedQuery: jest.fn(),
}));
jest.mock('pmtiles', () => ({Protocol: jest.fn()}));
jest.mock('@protomaps/basemaps', () => ({
  layers: () => [],
  namedFlavor: jest.fn(),
}));
jest.mock('@/utils/map-utils', () => ({
  attributions: jest.requireActual('@/utils/map-utils/mapUtils').attributions,
  defaultMapCenter: {longitude: -79.4, latitude: 43.6},
  GeocoderSearch: () => null,
}));
// filled in by the react-map-gl mock below when the page renders
const mockMapProps: {onClick?: (event: unknown) => void} = {};
const mockSourceData: unknown[] = [];

jest.mock('react-map-gl/maplibre', () => {
  const React = jest.requireActual('react');
  return {
    __esModule: true,
    default: React.forwardRef(
      (
        {
          children,
          onClick,
        }: {children: React.ReactNode; onClick: (event: unknown) => void},
        _ref: unknown
      ) => {
        mockMapProps.onClick = onClick;
        return <div>{children}</div>;
      }
    ),
    Source: ({children, data}: {children: React.ReactNode; data?: unknown}) => {
      if (data) mockSourceData.push(data);
      return <div>{children}</div>;
    },
    Layer: () => null,
    GeolocateControl: () => null,
    NavigationControl: () => null,
  };
});

const queryMock = jest.mocked(useLtsDataLastModifiedQuery);
function mockLastModified(data: string | null | undefined) {
  queryMock.mockReturnValue({data} as ReturnType<
    typeof useLtsDataLastModifiedQuery
  >);
}

it('shows the date the LTS data was last updated', () => {
  mockLastModified('2026-10-31');
  render(<LtsMapPage />);
  expect(screen.getByText('Data Last Updated: 2026-10-31')).toBeInTheDocument();
});

// null: no usable Last-Modified header; undefined: still loading or request failed
it.each([null, undefined])(
  'shows "unknown" when the last updated date is %p',
  data => {
    mockLastModified(data);
    render(<LtsMapPage />);
    expect(screen.getByText('Data Last Updated: unknown')).toBeInTheDocument();
  }
);

it('passes plain-object properties to the selected segment source', () => {
  mockLastModified(null);
  Element.prototype.scrollIntoView = jest.fn(); // not implemented in jsdom
  render(<LtsMapPage />);

  // maplibre-gl v6 returns vector tile feature properties without a prototype
  const properties = Object.assign(Object.create(null), {
    lts: 3,
    name: 'Bloor Street West',
  });
  const feature = {
    properties,
    geometry: {
      type: 'LineString',
      coordinates: [
        [-79.4, 43.66],
        [-79.39, 43.66],
      ],
    },
  };
  act(() =>
    mockMapProps.onClick!({
      point: {x: 0, y: 0},
      target: {queryRenderedFeatures: () => [feature]},
    })
  );

  expect(screen.getByText('Bloor Street West')).toBeInTheDocument();
  // react-map-gl's Source diffing calls hasOwnProperty on these properties
  const data = mockSourceData.at(-1) as {properties: object};
  expect(Object.getPrototypeOf(data.properties)).toBe(Object.prototype);
});
