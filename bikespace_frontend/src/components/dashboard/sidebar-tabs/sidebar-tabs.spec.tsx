import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import {SidebarTabs} from './SidebarTabs';

describe('renders tabs correctly', () => {
  render(<SidebarTabs />);

  const element = screen.getByText(/Data/);

  expect(element).toBeInTheDocument();
});
