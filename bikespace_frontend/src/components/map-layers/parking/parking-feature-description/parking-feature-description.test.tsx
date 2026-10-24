import {useState} from 'react';
import {render, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';

import {ParkingFeatureDescription} from './ParkingFeatureDescription';

import type {FeatureCollection} from 'geojson';
import {
  IssueType,
  ParkingDuration,
  SubmissionApiPayload,
} from '@/interfaces/Submission';

import testParkingDataSrc from '@/__test__/test_data/testParkingData.json';

const testParkingData = testParkingDataSrc as FeatureCollection;

const mockHandleClick = jest.fn();
const mockHandleHover = jest.fn();
const mockHandleUnHover = jest.fn();
const mockCenterFeatureOnMap = jest.fn();
const mockReportIssue = jest.fn();

function ContextMock() {
  const [selected, setSelected] = useState<boolean>(false);
  const handleClick = () => setSelected(!selected);

  return (
    <ParkingFeatureDescription
      selected={selected}
      hovered={false}
      feature={testParkingData.features[1]}
      handleClick={handleClick}
      handleHover={mockHandleHover}
      handleUnHover={mockHandleUnHover}
      centerFeatureOnMap={mockCenterFeatureOnMap}
      onReportIssue={mockReportIssue}
    />
  );
}

describe('ParkingFeatureDescription', () => {
  test('Selecting the feature should change the select button to map centering', async () => {
    const user = userEvent.setup();
    render(<ContextMock />);

    const selectFeatureButton = screen.getByText(/select/i, {
      selector: 'button',
    });
    await user.click(selectFeatureButton);
    expect(selectFeatureButton).toHaveTextContent(/center/i);
  });

  test('Toggling show/hide all data should show/hide all data', async () => {
    const user = userEvent.setup();
    render(
      <ParkingFeatureDescription
        selected={false}
        hovered={false}
        feature={testParkingData.features[1]}
        handleClick={mockHandleClick}
        handleHover={mockHandleHover}
        handleUnHover={mockHandleUnHover}
        centerFeatureOnMap={mockCenterFeatureOnMap}
        onReportIssue={mockReportIssue}
      />
    );

    const selectFeatureButton = screen.getByText(/show all data/i, {
      selector: 'button',
    });

    // no interaction
    expect(selectFeatureButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryAllByRole('definition')).toHaveLength(0);

    // click -> open
    await user.click(selectFeatureButton);
    expect(selectFeatureButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryAllByRole('definition')).not.toHaveLength(0);

    // click -> close
    await user.click(selectFeatureButton);
    expect(selectFeatureButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryAllByRole('definition')).toHaveLength(0);
  });

  test('Linked reports are shown when provided, and hidden otherwise', () => {
    const linkedReport: SubmissionApiPayload = {
      id: 42,
      latitude: 43.65322,
      longitude: -79.384452,
      issues: [IssueType.Damaged],
      parking_time: '2026-01-01T12:00:00.000Z',
      parking_duration: ParkingDuration.Hours,
      comments: 'Rack was bent and unusable',
      submitted_datetime: '2026-01-01T12:00:00.000Z',
      user: null,
    };

    const {rerender} = render(
      <ParkingFeatureDescription
        selected={false}
        hovered={false}
        feature={testParkingData.features[1]}
        handleClick={mockHandleClick}
        handleHover={mockHandleHover}
        handleUnHover={mockHandleUnHover}
        centerFeatureOnMap={mockCenterFeatureOnMap}
        onReportIssue={mockReportIssue}
        linkedReports={[linkedReport]}
      />
    );

    expect(screen.getByText(/1 user report/i)).toBeInTheDocument();
    expect(screen.getByText(/rack was bent and unusable/i)).toBeInTheDocument();

    rerender(
      <ParkingFeatureDescription
        selected={false}
        hovered={false}
        feature={testParkingData.features[1]}
        handleClick={mockHandleClick}
        handleHover={mockHandleHover}
        handleUnHover={mockHandleUnHover}
        centerFeatureOnMap={mockCenterFeatureOnMap}
        onReportIssue={mockReportIssue}
      />
    );

    expect(screen.queryByText(/user report/i)).not.toBeInTheDocument();
  });
});
