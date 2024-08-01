import {StateCreator} from 'zustand';

export enum SidebarTab {
  Data = 'data',
  Filters = 'filters',
  Feed = 'feed',
}

export interface TabSlice {
  tab: SidebarTab;
  setTab: (tab: SidebarTab) => void;
}

export const createTabSlice: StateCreator<
  TabSlice,
  [],
  [],
  TabSlice
> = set => ({
  tab: SidebarTab.Data,
  setTab: tab => set(() => ({tab})),
});
