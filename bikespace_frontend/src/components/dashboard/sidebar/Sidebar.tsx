import {useStore} from '@/states/store';

import {SidebarTabs} from '../sidebar-tabs';
import {SidebarTabContent} from '../sidebar-tab-content';

import chevronUp from '@/assets/icons/chevron-up.svg';
import chevronDown from '@/assets/icons/chevron-down.svg';

import styles from './sidebar.module.scss';

export function Sidebar() {
  const {isOpen, setIsOpen} = useStore(state => state.ui.sidebar);

  return (
    <div className={`${styles.sidebar} ${isOpen ? '' : styles.closed}`}>
      <button
        className={styles.drawerHandle}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <img
          src={isOpen ? chevronDown.src : chevronUp.src}
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
