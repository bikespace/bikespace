import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {BikeTheftMapPage} from './BikeTheftMapPage';
import {useBikeTheftDataQuery} from '@/hooks/use-bike-theft-data-query';
const mockExpandCluster = jest.fn().mockResolvedValue(15);
const mockEaseTo = jest.fn();

// Run the tests in the Toronto timezone
// : TZ='America/Toronto' npx jest --runInBand --coverage=false src/hooks/use-bike-theft-data-query.test.ts src/components/biketheft-map/biketheft-map-page/BikeTheftMapPage.test.tsx

// Test aspect
// Sidebar: Showing 2 reports
// Map source: only A and B
// If A and B share coordinates: location count 2
// If clustered together: cluster count 2

// Mock the map's clustering engine to return a single cluster with a count of 2 for the test data.
it('keeps sidebar, map, and location counts aligned after validation and combined filters', async () => {
  const {fetchBikeTheftReports} = jest.requireActual(
    '@/hooks/use-bike-theft-data-query'
  );
  const originalFetch = global.fetch;
  const queryMock = jest.mocked(useBikeTheftDataQuery);
  const originalQuery = queryMock.getMockImplementation()!;
  const feature = (
    id: string,
    status: string,
    date: string,
    location = 'Outside',
    coordinates: number[] | null = [-79.4, 43.6]
  ) => ({
    type: 'Feature',
    properties: {id, status, date, location, description: id},
    geometry: {type: 'Point', coordinates},
  });
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      type: 'FeatureCollection',
      features: [
        feature('a', 'stolen', '2025-01-01'),
        feature('b', 'unknown', '2025-12-31'),
        feature('c', 'recovered', '2025-06-01'),
        feature('d', 'stolen', '2025-06-01', 'Outside', [0, 0]),
        feature('e', 'stolen', '2025-06-01', 'Outside', null),
        feature('f', 'stolen', '2024-12-31'),
        feature('g', 'stolen', '2025-06-01', 'House', [-79.5, 43.7]),
        feature('h', 'stolen', '2025-06-01', 'Outside', [181, 43.6]),
        feature('i', 'stolen', '2026-01-01'),
      ],
    }),
  });
  try {
    const data = await fetchBikeTheftReports(
      'https://example.com/reports.geojson'
    );
    queryMock.mockImplementation(() => ({...originalQuery(), data}));
    const user = userEvent.setup();
    render(<BikeTheftMapPage />);
    const expectCounts = (ids: string[], locationCounts: number[]) => {
      const Supercluster = jest.requireActual('supercluster');
      const source = JSON.parse(
        screen.getByTestId('stolen-bikes').textContent!
      );
      expect(
        source.features.map((f: {properties: {id: string}}) => f.properties.id)
      ).toEqual(ids);
      // Run the map's clustering engine on the actual filtered source.
      const clusters = new Supercluster({radius: 40, maxZoom: 14})
        .load(source.features)
        .getClusters([-180, -90, 180, 90], 0);
      expect(
        clusters.map(
          (f: {properties: {point_count?: number}}) =>
            f.properties.point_count ?? 1
        )
      ).toEqual(ids.length ? [ids.length] : []);
      expect(
        screen.getByText(
          (_, element) =>
            element?.tagName === 'P' &&
            element.textContent ===
              `Showing ${ids.length} report${ids.length === 1 ? '' : 's'}`
        )
      ).toBeInTheDocument();
      const counts = JSON.parse(
        screen.getByTestId('stolen-bike-counts').textContent!
      );
      expect(
        counts.features.map(
          (f: {properties: {count: number}}) => f.properties.count
        )
      ).toEqual(locationCounts);
    };
    expectCounts(['a', 'b', 'c', 'f', 'i'], [5]);
    fireEvent.change(screen.getByLabelText('From'), {
      target: {value: '2025-01-01'},
    });
    fireEvent.change(screen.getByLabelText('To'), {
      target: {value: '2025-12-31'},
    });
    expectCounts(['a', 'b', 'c'], [3]);
    await user.click(screen.getByRole('button', {name: 'Stolen'}));
    expectCounts(['a', 'b'], [2]);
    await user.selectOptions(
      screen.getByLabelText('Filter by location'),
      'all'
    );
    expectCounts(['a', 'b', 'g'], [2]);
    await user.selectOptions(
      screen.getByLabelText('Filter by location'),
      'House'
    );
    expectCounts(['g'], []);
    await user.click(screen.getByRole('button', {name: 'Recovered'}));
    expectCounts([], []);
    await user.selectOptions(
      screen.getByLabelText('Filter by location'),
      'all'
    );
    expectCounts(['c'], []);
    await user.click(screen.getByRole('button', {name: 'All', exact: true}));
    expectCounts(['a', 'b', 'c', 'g'], [3]);
    await user.click(screen.getByRole('button', {name: 'Clear dates'}));
    expectCounts(['a', 'b', 'c', 'f', 'g', 'i'], [5]);
  } finally {
    global.fetch = originalFetch;
    queryMock.mockImplementation(originalQuery);
  }
});

// Mock the bike theft data query to return a small set of reports for testing.
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
    useBikeTheftDataQuery: jest.fn(() => ({
      data,
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    })),
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
