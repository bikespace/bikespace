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
  const tabContext = useContext(TabContext);

  return (
    <nav className={styles.tabs}>
      {tabs.map(tab => (
        <button
          key={tab.name}
          className={`${styles.tab} ${
            tab.name === tabContext?.tab ? styles.active : ''
          }`}
          onClick={() => {
            tabContext?.setTab(tab.name);
          }}
        >
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
