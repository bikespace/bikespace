import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';

import {SidebarTab} from '../context';

import {SidebarTabs} from './SidebarTabs';

const tabContext = {
  tab: SidebarTab.Data,
  setTab: jest.fn(),
};

describe('SidebarTabs', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn(React, 'useContext').mockReturnValue(tabContext as any);

    render(<SidebarTabs />);
  });

  test('should render tabs properly', () => {
    for (const label of ['Data', 'Filters', 'Feed']) {
      const element = screen.getByText(new RegExp(label));

      expect(element).toBeInTheDocument();
    }
  });

  test('should update tab state when clicked', () => {
    fireEvent.click(screen.getByText('Filters'));

    expect(tabContext.setTab).toHaveBeenCalledWith(SidebarTab.Filters);
  });
});
