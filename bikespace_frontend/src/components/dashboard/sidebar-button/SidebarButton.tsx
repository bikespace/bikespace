import React from 'react';

import styles from './sidebar-button.module.scss';

export function SidebarButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`${styles.primaryBtn} ${className}`}>
      {children}
    </button>
  );
}
