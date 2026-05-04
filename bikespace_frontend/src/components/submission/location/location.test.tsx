import React from 'react';
import {render, screen} from '@testing-library/react';
import {FormProvider, useForm} from 'react-hook-form';

import {defaultMapCenter} from '@/utils/map-utils';

import {SubmissionSchema} from '../submission-form/schema';

import {Location} from './Location';

jest.mock('react-leaflet', () => ({
  MapContainer: ({children, center}: any) => (
    <div data-testid="map-container" data-center={JSON.stringify(center)}>
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
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
});
