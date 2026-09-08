import {render, screen} from '@testing-library/react';
import {FormProvider, useForm} from 'react-hook-form';

import {defaultMapCenter} from '@/utils/map-utils';

import {SubmissionSchema} from '../submission-form/schema';

import {Location} from './Location';

const originalMaptilerApiKey = process.env.MAPTILER_API_KEY;

afterEach(() => {
  if (originalMaptilerApiKey === undefined) {
    delete process.env.MAPTILER_API_KEY;
  } else {
    process.env.MAPTILER_API_KEY = originalMaptilerApiKey;
  }
});

jest.mock('react-leaflet', () => ({
  MapContainer: ({children, center}: any) => (
    <div data-testid="map-container" data-center={JSON.stringify(center)}>
      {children}
    </div>
  ),
  TileLayer: ({url, attribution}: {url: string; attribution: string}) => (
    <div
      data-testid="tile-layer"
      data-url={url}
      data-attribution={attribution}
    />
  ),
  Marker: ({position}: any) => (
    <div data-testid="marker" data-position={JSON.stringify(position)} />
  ),
}));

const MockLocation = ({
  location = defaultMapCenter,
  useUrlLocation = false,
}: {
  location?: SubmissionSchema['location'];
  useUrlLocation?: boolean;
}) => {
  const form = useForm<SubmissionSchema>({
    defaultValues: {
      location,
    },
  });

  return (
    <FormProvider {...form}>
      <form>
        <Location handler={<></>} useUrlLocation={useUrlLocation} />
      </form>
    </FormProvider>
  );
};

describe('Test Location page component', () => {
  test('Title should be rendered properly', () => {
    render(<MockLocation />);

    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent(
      'Where was the problem?'
    );
  });

  test('Marker renders at the selected location', () => {
    const selectedLocation = {
      latitude: 43.642,
      longitude: -79.387,
    };

    render(<MockLocation location={selectedLocation} useUrlLocation />);

    expect(screen.getByTestId('marker')).toHaveAttribute(
      'data-position',
      JSON.stringify([selectedLocation.latitude, selectedLocation.longitude])
    );
  });

  test('Uses MapTiler tiles with the configured key and attribution', () => {
    process.env.MAPTILER_API_KEY = 'test-maptiler-key';

    render(<MockLocation />);

    const tileLayer = screen.getByTestId('tile-layer');
    expect(tileLayer).toHaveAttribute(
      'data-url',
      'https://api.maptiler.com/maps/streets-v4/256/{z}/{x}/{y}.png?key=test-maptiler-key'
    );
    expect(tileLayer.getAttribute('data-attribution')).toContain('MapTiler');
    expect(tileLayer.getAttribute('data-attribution')).toContain(
      'OpenStreetMap'
    );
  });
});
