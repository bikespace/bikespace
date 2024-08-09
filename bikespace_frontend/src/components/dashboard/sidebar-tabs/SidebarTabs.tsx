import React from 'react';

import {useSubmissionsStore} from '@/store';
import {SidebarTab} from '@/store/slices';

import styles from './sidebar-tabs.module.scss';

const tabs = [
  {
    label: 'Data',
    name: SidebarTab.Data,
  },
  {
    label: 'Filters',
    name: SidebarTab.Filters,
  },
  {
    label: 'Feed',
    name: SidebarTab.Feed,
  },
];

export function SidebarTabs() {
  const {tab, setTab} = useSubmissionsStore(state => ({
    tab: state.tab,
    setTab: state.setTab,
  }));

  return (
    <nav className={styles.tabs}>
      {tabs.map(t => (
        <button
          key={t.name}
          className={`${styles.tab} ${t.name === tab ? styles.active : ''}`}
          onClick={() => {
            setTab(t.name);
          }}
        >
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
