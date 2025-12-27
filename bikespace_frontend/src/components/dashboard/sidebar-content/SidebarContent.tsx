import React from 'react';

import {SidebarTab, useSidebarTab} from '@/states/url-params';
import {useStore} from '@/states/store';

import {ClearFiltersButton} from '../clear-filters-button';
import {SidebarContentFilters} from './_SidebarContentFilters';
import {SidebarContentInsights} from './_SidebarContentInsights';
import {SidebarContentFeed} from './_SidebarContentFeed';
import {SidebarContentInfo} from './_SidebarContentInfo';

import styles from './sidebar-content.module.scss';

export function SidebarContent() {
  const {setIsOpen} = useStore(state => state.ui.sidebar);

  const [tab, setTab] = useSidebarTab();

  const renderContent = () => {
    switch (tab) {
      case SidebarTab.Insights:
        return <SidebarContentInsights />;
      case SidebarTab.Filters:
        return <SidebarContentFilters />;
      case SidebarTab.Feed:
        return <SidebarContentFeed />;
      case SidebarTab.Info:
        return <SidebarContentInfo />;
      default:
        return <SidebarContentInsights />;
    }
  };

  const feedStyle = tab === SidebarTab.Feed ? styles.Feed : '';

  return (
    <div className={`${styles.SidebarContent} ${feedStyle}`}>
      <div className={styles.SidebarContentInner}>
        <ClearFiltersButton />
        {renderContent()}
      </div>
      <div className={styles.actions}>
        <button
          onClick={() => {
            setIsOpen(false);
            setTab(null);
          }}
          className={styles.action}
        >
          Back to Map
        </button>
      </div>
    </div>
  );
}
