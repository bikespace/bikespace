import React from 'react';

import {ClearFiltersButton} from '../clear-filters-button';
import {SidebarContentFilters} from '../sidebar-content-filter';
import {SidebarContentInsights} from '../sidebar-content-insights';
import {SidebarContentFeed} from '../sidebar-content-feed';
import {SidebarTab, useSidebarTab} from '@/states/url-params';

import styles from './sidebar-tab-content.module.scss';
import {useStore} from '@/states/store';

export function SidebarTabContent() {
  const {setIsOpen} = useStore(state => state.ui.sidebar);

  const [tab] = useSidebarTab();

  const renderContent = () => {
    switch (tab) {
      case SidebarTab.Insights:
        return <SidebarContentInsights />;
      case SidebarTab.Filters:
        return <SidebarContentFilters />;
      case SidebarTab.Feed:
        return <SidebarContentFeed />;
      default:
        return <SidebarContentInsights />;
    }
  };

  return (
    <div className={styles.tabContent}>
      <ClearFiltersButton />
      {renderContent()}
      <div className={styles.actions}>
        <button onClick={() => setIsOpen(false)} className={styles.action}>
          Back to Map
        </button>
      </div>
    </div>
  );
}
