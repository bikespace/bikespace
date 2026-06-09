import {useQueryState, parseAsStringEnum} from 'nuqs';

export enum SidebarTab {
  Insights = 'insights',
  Filters = 'filters',
  Feed = 'feed',
  Info = 'info',
}

export const useSidebarTab = () => {
  return useQueryState(
    'tab',
    parseAsStringEnum<SidebarTab>(Object.values(SidebarTab))
  );
};
