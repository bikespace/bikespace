import React, {useState} from 'react';

import {SidebarTabs} from '../sidebar-tabs';
import {SidebarTabContent} from '../sidebar-tab-content';

import styles from './sidebar.module.scss';

export function Sidebar() {
  const [open, setOpen] = useState<boolean>(true);

  return (
    <div className={`${styles.sidebar} ${open ? '' : styles.closed}`}>
      <button
        className={styles.drawerHandle}
        onClick={() => {
          setOpen(prev => !prev);
        }}
      />
      <div className={styles.sidebarContent}>
        <SidebarTabs />
        <SidebarTabContent />
      </div>
    </div>
  );
}
