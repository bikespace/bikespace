import {useQueryState, parseAsStringEnum} from 'nuqs';

import {SidebarTab} from './types';

export const useSidebarTab = () => {
  const [tab, setTab] = useQueryState(
    'tab',
    parseAsStringEnum<SidebarTab>(Object.values(SidebarTab))
      .withDefault(SidebarTab.Data)
      .withOptions({
        shallow: true,
        history: 'push',
      })
  );

  return {tab, setTab};
};
