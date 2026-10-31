import React from 'react';
import {render, screen} from '@testing-library/react';
import {LtsMapPage} from './LtsMapPage';
import {useLtsDataLastModifiedQuery} from '@/hooks/use-lts-data-last-modified-query';

jest.mock('@/hooks/use-lts-data-last-modified-query', () => ({
  useLtsDataLastModifiedQuery: jest.fn(),
}));
jest.mock('maplibre-gl', () => ({addProtocol: jest.fn()}));
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
jest.mock('react-map-gl/maplibre', () => {
  const React = jest.requireActual('react');
  return {
    __esModule: true,
    default: React.forwardRef(
      ({children}: {children: React.ReactNode}, _ref: unknown) => (
        <div>{children}</div>
      )
    ),
    Source: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
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
