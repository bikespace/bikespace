import React, {useContext} from 'react';

import {TabContext} from '../context';

import {ClearFiltersButton} from '../clear-filters-button';
import {SidebarContentFilters} from '../sidebar-content-filter';
import {SidebarContentData} from '../sidebar-content-data';
import {SidebarContentFeed} from '../sidebar-content-feed';

import * as styles from './sidebar-tab-content.module.scss';

export function SidebarTabContent() {
  const {tab} = useContext(TabContext)!;

  const renderContent = () => {
    switch (tab) {
      case 'data':
        return <SidebarContentData />;
      case 'filters':
        return <SidebarContentFilters />;
      case 'feed':
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
