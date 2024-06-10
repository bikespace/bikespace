import React, {useContext} from 'react';

import {TabContext} from '../context';

import * as styles from './sidebar-tabs.module.scss';

const tabs = [
  {
    label: 'Data',
    name: 'data',
  },
  {
    label: 'Filters',
    name: 'filters',
  },
  {
    label: 'Feed',
    name: 'feed',
  },
];

export function SidebarTabs() {
  const {tab, setTab} = useContext(TabContext)!;

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
