import {useState, useEffect} from 'react';
import {useIsMobile} from '@/hooks/use-is-mobile';

import {SidebarTabs} from '../sidebar-tabs';
import {SidebarTabContent} from '../sidebar-tab-content';

import styles from './sidebar.module.scss';
import {useStore} from '@/states/store';

export function Sidebar() {
  const isMobile = useIsMobile();
  const {isOpen, setIsOpen} = useStore(state => state.ui.sidebar);

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [isMobile]);

  return (
    <div className={styles.sidebar}>
      <SidebarTabs />
      {isOpen && <SidebarTabContent />}
    </div>
  );
}
