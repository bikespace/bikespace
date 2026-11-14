import React from 'react';
import {render} from '@testing-library/react';

import {
  IssueType,
  ParkingDuration,
  SubmissionApiPayload,
} from '@/interfaces/Submission';

import {MapMarker} from './MapMarker';

// Record the props react-leaflet's <Marker> receives on each render. Its
// updateMarker() calls setLatLng()/setIcon() whenever `position`/`icon` change
// by reference, and setLatLng() makes markercluster collapse a spiderfied
// cluster, so these props must stay referentially stable across re-renders.
const markerProps: Array<{position: unknown; icon: unknown}> = [];

jest.mock('react-leaflet', () => ({
  Marker: ({
    position,
    icon,
    children,
  }: {
    position: unknown;
    icon: unknown;
    children: React.ReactNode;
  }) => {
    markerProps.push({position, icon});
    return <div>{children}</div>;
  },
}));

jest.mock('../map-popup', () => {
  const ReactActual = jest.requireActual('react');
  return {
    MapPopup: ReactActual.forwardRef(() => null),
  };
});

const submission: SubmissionApiPayload = {
  id: 1,
  latitude: 43.6532,
  longitude: -79.3832,
  issues: [IssueType.Abandoned],
  parking_time: '2023-01-01T12:00:00',
  parking_duration: ParkingDuration.Minutes,
  comments: '',
  submitted_datetime: null,
  user: null,
};

const lastProps = () => markerProps[markerProps.length - 1];

describe('MapMarker', () => {
  beforeEach(() => {
    markerProps.length = 0;
  });

  test('keeps position and icon stable when re-rendered with the same props', () => {
    const onClick = jest.fn();
    const {rerender} = render(
      <MapMarker submission={submission} isSelected={false} onClick={onClick} />
    );
    const first = lastProps();

    // simulate a parent re-render with equivalent (new object) props
    rerender(
      <MapMarker
        submission={{...submission}}
        isSelected={false}
        onClick={jest.fn()}
      />
    );
    const second = lastProps();

    expect(markerProps.length).toBeGreaterThanOrEqual(2);
    expect(second.position).toBe(first.position);
    expect(second.icon).toBe(first.icon);
  });

  test('changes only the icon when selection changes', () => {
    const {rerender} = render(
      <MapMarker
        submission={submission}
        isSelected={false}
        onClick={jest.fn()}
      />
    );
    const unselected = lastProps();

    rerender(
      <MapMarker
        submission={submission}
        isSelected={true}
        onClick={jest.fn()}
      />
    );
    const selected = lastProps();

    expect(selected.position).toBe(unselected.position);
    expect(selected.icon).not.toBe(unselected.icon);
  });

  test('changes position when the coordinates change', () => {
    const {rerender} = render(
      <MapMarker
        submission={submission}
        isSelected={false}
        onClick={jest.fn()}
      />
    );
    const before = lastProps();

    rerender(
      <MapMarker
        submission={{...submission, latitude: 43.7}}
        isSelected={false}
        onClick={jest.fn()}
      />
    );
    const after = lastProps();

    expect(after.position).not.toBe(before.position);
    expect(after.position).toEqual([43.7, submission.longitude]);
  });
});
