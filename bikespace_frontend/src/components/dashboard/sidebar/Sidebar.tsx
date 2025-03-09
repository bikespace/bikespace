import React, {useState} from 'react';

import {SidebarTabs} from '../sidebar-tabs';
import {SidebarTabContent} from '../sidebar-tab-content';

import chevronUp from '@/assets/icons/chevron-up.svg';
import chevronDown from '@/assets/icons/chevron-down.svg';

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
      >
        <img
          src={open ? chevronDown.src : chevronUp.src}
          width={24}
          style={{pointerEvents: 'none'}}
        />
      </button>
      <div className={styles.sidebarContent}>
        <SidebarTabs />
        <SidebarTabContent />
      </div>
    </div>
  );
}
