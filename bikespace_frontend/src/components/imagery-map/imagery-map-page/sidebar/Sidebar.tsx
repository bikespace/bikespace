import React from 'react';

import chevronUp from '@/assets/icons/chevron-up.svg';
import chevronDown from '@/assets/icons/chevron-down.svg';

import styles from './sidebar.module.scss';

export function Sidebar({
  children,
  isOpen,
  setIsOpen,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className={`${styles.sidebar} ${isOpen ? '' : styles.closed}`}>
      <button
        className={styles.drawerHandle}
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <img
          src={isOpen ? chevronDown.src : chevronUp.src}
          alt={isOpen ? 'close details pane' : 'open details pane'}
          width={24}
          style={{pointerEvents: 'none'}}
        />
      </button>
      <div className={styles.sidebarContent}>{children}</div>
    </div>
  );
}
