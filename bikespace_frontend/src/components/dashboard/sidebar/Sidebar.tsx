import {useEffect} from 'react';
import {useIsMobile} from '@/hooks/use-is-mobile';

import {SidebarTabs} from '../sidebar-tabs';
import {SidebarContent} from '../sidebar-content';

import styles from './sidebar.module.scss';
import {useStore} from '@/states/store';
import {useSidebarTab} from '@/states/url-params';

function Sidebar() {
  const isMobile = useIsMobile();
  const {isOpen, setIsOpen} = useStore(state => state.ui.sidebar);
  const [currentTab] = useSidebarTab();

  useEffect(() => {
    if (isMobile && !currentTab) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [isMobile]);

  const openStyle = isOpen ? styles.Open : '';
  return (
    <div className={`${styles.Sidebar} ${openStyle}`}>
      <SidebarTabs />
      {isOpen && <SidebarContent />}
    </div>
  );
}

export default Sidebar;
