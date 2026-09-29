import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {BikeTheftMapPage} from './BikeTheftMapPage';
const mockExpandCluster = jest.fn().mockResolvedValue(15);
const mockEaseTo = jest.fn();

jest.mock('@/hooks/use-bike-theft-data-query', () => {
  const data = [
    {
      id: 'a',
      date: '2025-03-15',
      location: 'House',
      bikeType: 'Road bike',
      color: 'Blue',
      description: 'Blue road bike',
      status: 'stolen',
      longitude: -79.4,
      latitude: 43.6,
    },
    {
      id: 'b',
      date: '2024-04-16',
      location: 'Outside',
      bikeType: 'Mountain bike',
      color: 'Red',
      description: 'Red mountain bike',
      status: 'recovered',
      longitude: -79.4,
      latitude: 43.6,
    },
  ];
  return {
    useBikeTheftDataQuery: () => ({
      data,
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    }),
  };
});
jest.mock('maplibre-gl', () => ({addProtocol: jest.fn()}));
jest.mock('pmtiles', () => ({Protocol: jest.fn()}));
jest.mock('@protomaps/basemaps', () => ({
  layers: () => [],
  namedFlavor: jest.fn(),
}));
jest.mock('@/utils/map-utils', () => ({
  defaultMapCenter: {longitude: -79.4, latitude: 43.6},
  GeocoderSearch: () => null,
}));
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
        return (
          <div>
            {children}
            <button
              onClick={() =>
                onClick({
                  point: {},
                  target: {
                    queryRenderedFeatures: () => [
                      {properties: {id: 'a'}, layer: {id: 'stolen-pins-hit'}},
                      {properties: {id: 'b'}, layer: {id: 'stolen-pins-hit'}},
                      {properties: {id: 'a'}, layer: {id: 'stolen-pins-hit'}},
                    ],
                  },
                })
              }
            >
              Select report
            </button>
            <button
              onClick={() =>
                onClick({
                  point: {},
                  target: {
                    queryRenderedFeatures: () => [
                      {
                        properties: {cluster_id: 7},
                        geometry: {type: 'Point', coordinates: [-79.4, 43.6]},
                      },
                    ],
                    getSource: () => ({
                      getClusterExpansionZoom: mockExpandCluster,
                    }),
                    easeTo: mockEaseTo,
                  },
                })
              }
            >
              Expand cluster
            </button>
          </div>
        );
      }
    ),
    Source: ({
      id,
      data,
      children,
    }: {
      id: string;
      data: unknown;
      children: React.ReactNode;
    }) => (
      <div>
        <output data-testid={id}>{JSON.stringify(data)}</output>
        {children}
      </div>
    ),
    Layer: () => null,
    GeolocateControl: () => null,
    NavigationControl: () => null,
  };
});

it('filters inclusively across years and supports clearing or one-sided ranges', async () => {
  const user = userEvent.setup();
  render(<BikeTheftMapPage />);
  await user.selectOptions(screen.getByLabelText('Filter by location'), 'all');
  fireEvent.change(screen.getByLabelText('From'), {
    target: {value: '2024-04-16'},
  });
  fireEvent.change(screen.getByLabelText('To'), {
    target: {value: '2025-03-15'},
  });
  expect(screen.getByTestId('stolen-bikes')).toHaveTextContent(
    'Blue road bike'
  );
  expect(screen.getByTestId('stolen-bikes')).toHaveTextContent(
    'Red mountain bike'
  );
  fireEvent.change(screen.getByLabelText('From'), {
    target: {value: '2025-03-15'},
  });
  expect(screen.getByTestId('stolen-bikes')).not.toHaveTextContent(
    'Red mountain bike'
  );
  expect(screen.getByTestId('stolen-bikes')).toHaveTextContent(
    'Blue road bike'
  );
  fireEvent.change(screen.getByLabelText('From'), {
    target: {value: '2025-03-16'},
  });
  expect(screen.getByRole('alert')).toHaveTextContent('From date');
  expect(screen.getByTestId('stolen-bikes')).toHaveTextContent('"features":[]');
  await user.click(screen.getByRole('button', {name: 'Clear dates'}));
  expect(screen.getByLabelText('From')).toHaveValue('');
  expect(screen.getByLabelText('To')).toHaveValue('');
  fireEvent.change(screen.getByLabelText('To'), {
    target: {value: '2024-04-16'},
  });
  expect(screen.getByTestId('stolen-bikes')).not.toHaveTextContent(
    'Blue road bike'
  );
  expect(screen.getByTestId('stolen-bikes')).toHaveTextContent(
    'Red mountain bike'
  );
});

it('shows report details and selected geometry, then clears the selection', async () => {
  Element.prototype.scrollIntoView = jest.fn();
  const user = userEvent.setup();
  render(<BikeTheftMapPage />);
  await user.selectOptions(screen.getByLabelText('Filter by location'), 'all');
  fireEvent.change(screen.getByLabelText('From'), {
    target: {value: '2025-01-01'},
  });
  await user.click(screen.getByRole('button', {name: 'Select report'}));
  expect(screen.getByText('Blue road bike')).toBeInTheDocument();
  expect(screen.getByTestId('stolen-bikes-selected')).toHaveTextContent(
    '[-79.4,43.6]'
  );
  await user.click(screen.getByRole('button', {name: 'Clear Selection'}));
  expect(screen.queryByTestId('stolen-bikes-selected')).not.toBeInTheDocument();
  expect(screen.queryByText('Blue road bike')).not.toBeInTheDocument();
});

it('lists overlapping reports once each and clears selection when filters change', async () => {
  Element.prototype.scrollIntoView = jest.fn();
  const user = userEvent.setup();
  render(<BikeTheftMapPage />);
  await user.selectOptions(screen.getByLabelText('Filter by location'), 'all');
  await user.click(screen.getByRole('button', {name: 'Select report'}));
  expect(screen.getByText('2 reports selected')).toBeInTheDocument();
  expect(screen.getAllByRole('listitem')).toHaveLength(2);
  expect(screen.getByText('Blue road bike')).toBeInTheDocument();
  expect(screen.getByText('Red mountain bike')).toBeInTheDocument();
  const selected = JSON.parse(
    screen.getByTestId('stolen-bikes-selected').textContent!
  );
  expect(
    selected.features.map(
      (feature: {properties: {id: string}}) => feature.properties.id
    )
  ).toEqual(['a', 'b']);
  await user.click(screen.getByRole('button', {name: 'Stolen'}));
  expect(screen.queryByTestId('stolen-bikes-selected')).not.toBeInTheDocument();
  expect(
    screen.queryByRole('list', {name: 'Selected reports'})
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', {name: 'Select report'}));
  expect(screen.getByText('1 report selected')).toBeInTheDocument();
  expect(screen.queryByText('Red mountain bike')).not.toBeInTheDocument();
});

it('shows a count only for locations with multiple visible reports', async () => {
  const user = userEvent.setup();
  render(<BikeTheftMapPage />);
  await user.selectOptions(screen.getByLabelText('Filter by location'), 'all');
  const counts = JSON.parse(
    screen.getByTestId('stolen-bike-counts').textContent!
  );
  expect(counts.features).toEqual([
    {
      type: 'Feature',
      properties: {count: 2},
      geometry: {type: 'Point', coordinates: [-79.4, 43.6]},
    },
  ]);
  fireEvent.change(screen.getByLabelText('From'), {
    target: {value: '2025-01-01'},
  });
  expect(
    JSON.parse(screen.getByTestId('stolen-bike-counts').textContent!).features
  ).toEqual([]);
});

it('expands a clicked cluster to its expansion zoom', async () => {
  const user = userEvent.setup();
  render(<BikeTheftMapPage />);
  await user.selectOptions(screen.getByLabelText('Filter by location'), 'all');
  await user.click(screen.getByRole('button', {name: 'Expand cluster'}));
  expect(mockExpandCluster).toHaveBeenCalledWith(7);
  expect(mockEaseTo).toHaveBeenCalledWith({center: [-79.4, 43.6], zoom: 15});
  expect(
    screen.queryByRole('list', {name: 'Selected reports'})
  ).not.toBeInTheDocument();
});

it('applies calendar-year presets and clears their active state for custom dates', async () => {
  jest.useFakeTimers({now: new Date('2026-09-29T12:00:00-04:00')});
  const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
  try {
    render(<BikeTheftMapPage />);
    await user.selectOptions(
      screen.getByLabelText('Filter by location'),
      'all'
    );
    await user.click(screen.getByRole('button', {name: 'This year'}));
    expect(screen.getByLabelText('From')).toHaveValue('2026-01-01');
    expect(screen.getByLabelText('To')).toHaveValue('2026-12-31');
    expect(
      JSON.parse(screen.getByTestId('stolen-bikes').textContent!).features
    ).toEqual([]);
    expect(screen.getByRole('button', {name: 'This year'})).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await user.click(screen.getByRole('button', {name: 'Last year'}));
    expect(screen.getByLabelText('From')).toHaveValue('2025-01-01');
    expect(screen.getByLabelText('To')).toHaveValue('2025-12-31');
    expect(screen.getByTestId('stolen-bikes')).toHaveTextContent(
      'Blue road bike'
    );
    expect(screen.getByTestId('stolen-bikes')).not.toHaveTextContent(
      'Red mountain bike'
    );
    expect(screen.getByRole('button', {name: 'Last year'})).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', {name: 'This year'})).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    fireEvent.change(screen.getByLabelText('From'), {
      target: {value: '2025-02-01'},
    });
    expect(screen.getByRole('button', {name: 'Last year'})).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  } finally {
    jest.useRealTimers();
  }
});

it('preserves the dataset-based three-year preset and supports clearing dates', async () => {
  const user = userEvent.setup();
  render(<BikeTheftMapPage />);
  await user.selectOptions(screen.getByLabelText('Filter by location'), 'all');
  await user.click(screen.getByRole('button', {name: 'Last 3 years'}));
  expect(screen.getByLabelText('From')).toHaveValue('2023-01-01');
  expect(screen.getByLabelText('To')).toHaveValue('2025-12-31');
  expect(screen.getByTestId('stolen-bikes')).toHaveTextContent(
    'Red mountain bike'
  );
  fireEvent.change(screen.getByLabelText('From'), {
    target: {value: '2024-01-01'},
  });
  expect(screen.getByRole('button', {name: 'Last 3 years'})).toHaveAttribute(
    'aria-pressed',
    'false'
  );
  await user.click(screen.getByRole('button', {name: 'All Dates'}));
  expect(screen.getByLabelText('From')).toHaveValue('');
  expect(screen.getByLabelText('To')).toHaveValue('');
  expect(screen.getByRole('button', {name: 'All Dates'})).toHaveAttribute(
    'aria-pressed',
    'true'
  );
});

it('marks overlapping stolen and recovered reports as mixed, respecting filters', async () => {
  const user = userEvent.setup();
  render(<BikeTheftMapPage />);
  await user.selectOptions(screen.getByLabelText('Filter by location'), 'all');
  const properties = () =>
    JSON.parse(screen.getByTestId('stolen-bikes').textContent!).features.map(
      (f: {properties: {status: string; locationStatus: string}}) =>
        f.properties
    );
  expect(properties()).toEqual(
    expect.arrayContaining([
      expect.objectContaining({status: 'stolen', locationStatus: 'mixed'}),
      expect.objectContaining({status: 'recovered', locationStatus: 'mixed'}),
    ])
  );
  await user.click(screen.getByRole('button', {name: 'Stolen'}));
  expect(properties()).toEqual([
    expect.objectContaining({status: 'stolen', locationStatus: 'stolen'}),
  ]);
  await user.click(screen.getByRole('button', {name: 'Recovered'}));
  expect(properties()).toEqual([
    expect.objectContaining({status: 'recovered', locationStatus: 'recovered'}),
  ]);
});
