import React from 'react';

import {TabContext} from '../context';

import * as styles from './sidebar-tabs.module.scss';

export function SidebarTabs() {
  return (
    <TabContext.Consumer>
      {tabState => {
        if (!tabState) return null;

        return (
          <nav className={styles.tabs}>
            {tabs.map(tab => (
              <button
                className={`${styles.tab} ${
                  tab.name === tabState.tab ? styles.active : ''
                }`}
                onClick={() => {
                  tabState.setTab(tab.name);
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
