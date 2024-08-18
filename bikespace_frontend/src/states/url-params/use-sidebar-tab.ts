import {useQueryState, parseAsStringEnum} from 'nuqs';

export enum SidebarTab {
  Data = 'data',
  Filters = 'filters',
  Feed = 'feed',
}

export const useSidebarTab = () => {
  return useQueryState(
    'tab',
    parseAsStringEnum<SidebarTab>(Object.values(SidebarTab)).withDefault(
      SidebarTab.Data
    )
  );
};
