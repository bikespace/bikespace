import React, {useState} from 'react';

import {SubmissionApiPayload} from '@/interfaces/Submission';

import {SidebarTabs} from '../sidebar-tabs';
import {SidebarTabContent} from '../sidebar-tab-content';

import * as styles from './sidebar.module.scss';

interface SidebarProps {
  submissions: SubmissionApiPayload[];
}

export function Sidebar({submissions}: SidebarProps) {
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
        <SidebarTabContent submissions={submissions} />
      </div>
    </div>
  );
}
