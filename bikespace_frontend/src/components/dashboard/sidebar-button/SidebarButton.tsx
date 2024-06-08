import React from 'react';

import * as styles from './sidebar-button.module.scss';

export function SidebarButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${styles.primaryBtn} ${className}`} {...props}>
      {children}
    </button>
  );
}
