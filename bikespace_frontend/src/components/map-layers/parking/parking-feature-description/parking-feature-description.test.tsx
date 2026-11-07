import {useState} from 'react';
import {fireEvent, render, screen, within} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';

import {ParkingFeatureDescription} from './ParkingFeatureDescription';

import type {Feature, FeatureCollection} from 'geojson';
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

  test('does not show a cluster drill-down section when there are no cluster members', () => {
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

    expect(screen.queryByText(/cluster of/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: /individual parking spots/i})
    ).not.toBeInTheDocument();
  });

  test('shows, toggles, and reports issues for individual cluster members, grouping reports by which rack they are attributed to', async () => {
    const user = userEvent.setup();
    const mockClusterReportIssue = jest.fn();

    const clusteredFeature: Feature = {
      type: 'Feature',
      properties: {
        bicycle_parking: 'rack',
        meta_cluster_id: 'cluster-1',
      },
      geometry: {type: 'Point', coordinates: [-79.4, 43.66]},
    };
    const member1: Feature = {
      type: 'Feature',
      properties: {
        bicycle_parking: 'rack',
        description: 'North entrance rack',
        clusterMemberIndex: 1,
      },
      geometry: {type: 'Point', coordinates: [-79.4001, 43.6601]},
    };
    const member2: Feature = {
      type: 'Feature',
      properties: {
        bicycle_parking: 'rack',
        description: 'South entrance rack',
        clusterMemberIndex: 2,
      },
      geometry: {type: 'Point', coordinates: [-79.4002, 43.6602]},
    };
    const attributedReport: SubmissionApiPayload = {
      id: 99,
      latitude: 43.6602,
      longitude: -79.4002,
      issues: [IssueType.Damaged],
      parking_time: '2026-01-01T12:00:00.000Z',
      parking_duration: ParkingDuration.Hours,
      comments: 'Bent and unusable',
      submitted_datetime: '2026-01-01T12:00:00.000Z',
      user: null,
    };
    const generalReport: SubmissionApiPayload = {
      id: 100,
      latitude: 43.66,
      longitude: -79.4,
      issues: [IssueType.Full],
      parking_time: '2026-01-02T12:00:00.000Z',
      parking_duration: ParkingDuration.Hours,
      comments: 'Full, not sure which rack',
      submitted_datetime: '2026-01-02T12:00:00.000Z',
      user: null,
    };

    const mockMemberHover = jest.fn();
    const mockMemberUnHover = jest.fn();

    render(
      <ParkingFeatureDescription
        selected={false}
        hovered={false}
        feature={clusteredFeature}
        handleClick={mockHandleClick}
        handleHover={mockMemberHover}
        handleUnHover={mockMemberUnHover}
        centerFeatureOnMap={mockCenterFeatureOnMap}
        onReportIssue={mockClusterReportIssue}
        linkedReports={[attributedReport, generalReport]}
        clusterMembers={[
          {feature: member1},
          {feature: member2, linkedReports: [attributedReport]},
        ]}
      />
    );

    expect(
      screen.getByText('Cluster of 2 Parking Features')
    ).toBeInTheDocument();

    // the cluster's own report list splits reports that are attributable to
    // a specific rack from ones that can't be (filed too generally to tell
    // which rack in the cluster they're actually about)
    expect(screen.getByText('2 User Reports')).toBeInTheDocument();
    expect(screen.getByText('Reported on a specific rack')).toBeInTheDocument();
    expect(screen.getByText('Rack #2')).toBeInTheDocument();
    expect(screen.getByText('Bent and unusable')).toBeInTheDocument();
    expect(screen.getByText('Rack not specified')).toBeInTheDocument();
    expect(screen.getByText('Full, not sure which rack')).toBeInTheDocument();

    const toggle = screen.getByRole('button', {
      name: /view individual parking spots/i,
    });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('North entrance rack')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('img', {name: /relative positions/i})
    ).not.toBeInTheDocument();

    // expand -> both members' descriptions appear, titled with their own
    // number, each with their own Report Issue button (which come before the
    // clustered feature's own, in DOM order)
    await user.click(toggle);
    expect(toggle).toHaveAccessibleName(/hide individual parking spots/i);
    expect(screen.getByRole('heading', {name: /^#1/})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: /^#2/})).toBeInTheDocument();
    expect(screen.getByText('North entrance rack')).toBeInTheDocument();
    expect(screen.getByText('South entrance rack')).toBeInTheDocument();

    // a diagram showing each member's relative position is shown alongside
    // the list, with one dot per member
    const diagram = screen.getByRole('img', {name: /relative positions/i});
    expect(diagram.querySelectorAll('circle')).toHaveLength(3); // 2 members + 1 center marker

    // hovering a diagram dot calls the same hover handler as hovering the
    // member's own card, so it highlights that exact member on the map
    const diagramDotOne = within(diagram).getByText('1').closest('g')!;
    fireEvent.mouseEnter(diagramDotOne);
    expect(mockMemberHover).toHaveBeenCalledWith(expect.anything(), member1);
    fireEvent.mouseLeave(diagramDotOne);
    expect(mockMemberUnHover).toHaveBeenCalled();

    // member #2's own nested report list is already specific to one rack,
    // so it isn't further grouped into "specific rack" / "not specified"
    expect(screen.getAllByText(/1 user report/i)).toHaveLength(1);
    expect(screen.queryAllByText('Reported on a specific rack')).toHaveLength(
      1
    ); // only the top-level cluster's grouped list, not member #2's

    const reportButtons = screen.getAllByRole('button', {
      name: /report issue/i,
    });
    expect(reportButtons).toHaveLength(3); // clustered feature itself, member1, member2
    await user.click(reportButtons[1]);
    expect(mockClusterReportIssue).toHaveBeenCalledWith(member1);

    // collapse -> members hidden again
    await user.click(toggle);
    expect(toggle).toHaveAccessibleName(/view individual parking spots/i);
    expect(screen.queryByText('North entrance rack')).not.toBeInTheDocument();
  });

  test('a report matched to more than one close-together member is shown as attributed to all of them, not just the last', () => {
    // regression test: two racks sitting closer together than the tight
    // match radius can both legitimately claim the same report (seen on
    // real data - two City of Toronto bollards 2.2m apart both matching the
    // one report near them). The top-level breakdown must not let the
    // second member's claim silently overwrite the first's.
    const clusteredFeature: Feature = {
      type: 'Feature',
      properties: {bicycle_parking: 'bollard', meta_cluster_id: 'cluster-2'},
      geometry: {type: 'Point', coordinates: [-79.4, 43.66]},
    };
    const ambiguousReport: SubmissionApiPayload = {
      id: 582,
      latitude: 43.6601,
      longitude: -79.4001,
      issues: [IssueType.Damaged],
      parking_time: '2026-01-01T12:00:00.000Z',
      parking_duration: ParkingDuration.Hours,
      comments: '',
      submitted_datetime: '2026-01-01T12:00:00.000Z',
      user: null,
    };
    const member8: Feature = {
      type: 'Feature',
      properties: {bicycle_parking: 'bollard', clusterMemberIndex: 8},
      geometry: {type: 'Point', coordinates: [-79.40012, 43.66013]},
    };
    const member10: Feature = {
      type: 'Feature',
      properties: {bicycle_parking: 'bollard', clusterMemberIndex: 10},
      geometry: {type: 'Point', coordinates: [-79.40008, 43.66009]},
    };

    render(
      <ParkingFeatureDescription
        selected={false}
        hovered={false}
        feature={clusteredFeature}
        handleClick={mockHandleClick}
        handleHover={mockHandleHover}
        handleUnHover={mockHandleUnHover}
        centerFeatureOnMap={mockCenterFeatureOnMap}
        onReportIssue={mockReportIssue}
        linkedReports={[ambiguousReport]}
        clusterMembers={[
          {feature: member8, linkedReports: [ambiguousReport]},
          {feature: member10, linkedReports: [ambiguousReport]},
        ]}
      />
    );

    expect(
      screen.getByText(
        'Possibly rack #8 or #10 (too close together to tell apart)'
      )
    ).toBeInTheDocument();
    expect(screen.queryByText('Rack not specified')).not.toBeInTheDocument();
  });
});
