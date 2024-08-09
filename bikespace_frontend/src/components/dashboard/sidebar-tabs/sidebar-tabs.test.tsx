import React from 'react';
import {render, screen} from '@testing-library/react';

import {SidebarTabs} from './SidebarTabs';

describe('SidebarTabs', () => {
  beforeEach(() => {
    render(<SidebarTabs />);
  });

  test('should render tabs properly', () => {
    for (const label of ['Data', 'Filters', 'Feed']) {
      const element = screen.getByText(new RegExp(label));

      expect(element).toBeInTheDocument();
    }
  });
});
