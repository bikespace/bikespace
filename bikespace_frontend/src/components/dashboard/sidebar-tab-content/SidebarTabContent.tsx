import React, {useContext} from 'react';

import {TabContext, SidebarTab} from '@/context';

import {ClearFiltersButton} from '../clear-filters-button';
import {SidebarContentFilters} from '../sidebar-content-filter';
import {SidebarContentData} from '../sidebar-content-data';
import {SidebarContentFeed} from '../sidebar-content-feed';

import styles from './sidebar-tab-content.module.scss';

export function SidebarTabContent() {
  const {tab} = useContext(TabContext);

  const renderContent = () => {
    switch (tab) {
      case SidebarTab.Data:
        return <SidebarContentData />;
      case SidebarTab.Filters:
        return <SidebarContentFilters />;
      case SidebarTab.Feed:
        return <SidebarContentFeed />;
      default:
        return <SidebarContentData />;
    }
  };

  return (
    <div className={styles.tabContent}>
      <ClearFiltersButton />
      {renderContent()}
    </div>
  );
}
