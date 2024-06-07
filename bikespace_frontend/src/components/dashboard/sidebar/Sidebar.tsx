import React, {useState} from 'react';

import {SidebarTabs} from '../sidebar-tabs';

import * as styles from './sidebar.module.scss';

export function Sidebar() {
  const [open, setOpen] = useState<boolean>(true);

  return (
    <div className={styles.sidebar}>
      <button
        className={styles.drawerHandle}
        onClick={() => {
          setOpen(prev => !prev);
        }}
      />
      <div className={`${styles.sidebarContent} ${open ? '' : styles.closed}`}>
        <SidebarTabs />
      </div>
    </div>
  );
}
