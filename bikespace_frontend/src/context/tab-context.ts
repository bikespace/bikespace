import React, {createContext} from 'react';

export enum SidebarTab {
  Data = 'data',
  Filters = 'filters',
  Feed = 'feed',
}

export type TabContextData = {
  tab: SidebarTab;
  setTab: React.Dispatch<React.SetStateAction<SidebarTab>>;
};

export const TabContext = createContext<TabContextData>({
  tab: SidebarTab.Data,
  setTab: () => {},
});
