import React from 'react';

import {SidebarTab, useSidebarTab} from '@/states/url-params';

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
  const [tab, setTab] = useSidebarTab();

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
