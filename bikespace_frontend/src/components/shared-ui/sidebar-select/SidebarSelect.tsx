import React from 'react';

import styles from './sidebar-select.module.scss';

interface SidebarSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  umamiEvent?: string;
}

export function SidebarSelect({
  children,
  className,
  umamiEvent,
  ...props
}: SidebarSelectProps) {
  return (
    <select
      {...props}
      className={`${styles.sidebarSelect}` + (className ? ` ${className}` : '')}
      data-umami-event={umamiEvent}
    >
      {children}
    </select>
  );
}
