import React from 'react';

import {SidebarTab, useSidebarTab} from '@/states/url-params';

import insightsIcon from './icons/insights';
import filtersIcon from './icons/filters';
import feedIcon from './icons/feed';
import infoIcon from './icons/info';

import styles from './sidebar-tabs.module.scss';
import {useStore} from '@/states/store';

const tabs = [
  {
    label: 'Insights',
    name: SidebarTab.Insights,
    icon: insightsIcon,
  },
  {
    label: 'Filters',
    name: SidebarTab.Filters,
    icon: filtersIcon,
  },
  {
    label: 'Feed',
    name: SidebarTab.Feed,
    icon: feedIcon,
  },
  {
    label: 'Info',
    name: SidebarTab.Info,
    icon: infoIcon,
  },
];

export function SidebarTabs() {
  const {setIsOpen} = useStore(state => state.ui.sidebar);
  const [tab, setTab] = useSidebarTab();

  return (
    <nav className={styles.tabs}>
      {tabs.map(t => (
        <button
          key={t.name}
          className={`${styles.tab} ${t.name === tab ? styles.active : ''}`}
          onClick={() => {
            setIsOpen(true);
            setTab(t.name);
          }}
        >
          <t.icon />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
