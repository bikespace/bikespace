import React from 'react';

import {TabContext} from '../context';

import * as styles from './sidebar-tabs.module.scss';

export function SidebarTabs() {
  return (
    <TabContext.Consumer>
      {tabContext => {
        if (!tabContext) return null;

        return (
          <nav className={styles.tabs}>
            {tabs.map(tab => (
              <button
                className={`${styles.tab} ${
                  tab.name === tabContext.tab ? styles.active : ''
                }`}
                onClick={() => {
                  tabContext.setTab(tab.name);
                }}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        );
      }}
    </TabContext.Consumer>
  );
}

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
