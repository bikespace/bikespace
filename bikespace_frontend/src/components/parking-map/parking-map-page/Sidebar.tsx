import React, {useState} from 'react';

import styles from '@/components/dashboard/sidebar/sidebar.module.scss';

export function Sidebar({children}: {children: React.ReactNode}) {
  const [open, setOpen] = useState<boolean>(true);

  return (
    <div className={`${styles.sidebar} ${open ? '' : styles.closed}`}>
      <button
        className={styles.drawerHandle}
        onClick={() => {
          setOpen(prev => !prev);
        }}
      />
      <div className={styles.sidebarContent}>{children}</div>
    </div>
  );
}
