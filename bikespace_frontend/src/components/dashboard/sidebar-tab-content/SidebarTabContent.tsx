import React from 'react';

import {ClearFiltersButton} from '../clear-filters-button';
import {SidebarContentFilters} from './_SidebarContentFilters';
import {SidebarContentInsights} from './_SidebarContentInsights';
import {SidebarContentFeed} from './_SidebarContentFeed';
import {SidebarContentInfo} from './_SidebarContentInfo';
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
      case SidebarTab.Info:
        return <SidebarContentInfo />;
      default:
        return <SidebarContentInsights />;
    }
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.SidebarContent}>
        <ClearFiltersButton />
        {renderContent()}
      </div>
      <div className={styles.actions}>
        <button onClick={() => setIsOpen(false)} className={styles.action}>
          Back to Map
        </button>
      </div>
    </div>
  );
}
