import React, {useState} from 'react';
import {render, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';

import {ParkingFeatureDescription} from './ParkingFeatureDescription';

import type {FeatureCollection} from 'geojson';

import testParkingDataSrc from '@/__test__/test_data/testParkingData.json';

const testParkingData = testParkingDataSrc as FeatureCollection;

const mockHandleClick = jest.fn();
const mockHandleHover = jest.fn();
const mockHandleUnHover = jest.fn();

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
    />
  );
}

describe('ParkingFeatureDescription', () => {
  test('Selecting the feature should lock the select button', async () => {
    const user = userEvent.setup();
    render(<ContextMock />);

    const selectFeatureButton = screen.getByText(/select/i, {
      selector: 'button',
    });
    await user.click(selectFeatureButton);
    expect(selectFeatureButton).toBeDisabled();
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
});
