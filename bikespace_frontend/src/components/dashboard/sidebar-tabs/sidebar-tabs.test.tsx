import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';

import {TabContext, SidebarTab} from '../context';

import {SidebarTabs} from './SidebarTabs';

const tabContext = {
  tab: SidebarTab.Data,
  setTab: jest.fn(),
};

describe('SidebarTabs', () => {
  beforeEach(() => {
    render(
      <TabContext.Provider value={tabContext}>
        <SidebarTabs />
      </TabContext.Provider>
    );
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
