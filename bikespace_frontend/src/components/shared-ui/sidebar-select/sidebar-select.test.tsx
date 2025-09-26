import React from 'react';
import {render, screen} from '@testing-library/react';

import {SidebarSelect} from './SidebarSelect';

describe('SidebarSelect', () => {
  test('SidebarSelect renders its children', () => {
    render(
      <SidebarSelect>
        <option value="test-value">Test Value</option>
      </SidebarSelect>
    );

    expect(screen.getByText('Test Value')).toBeInTheDocument();
    expect(screen.getByText('Test Value')).toHaveValue('test-value');
  });

  test('SidebarSelect allows additional classes to be added', () => {
    render(
      <SidebarSelect className="added-class-1">
        <option value="test-value">Test Value</option>
      </SidebarSelect>
    );

    expect(screen.getByText('Test Value').parentElement).toHaveClass(
      /added-class-1/
    );
  });
});
