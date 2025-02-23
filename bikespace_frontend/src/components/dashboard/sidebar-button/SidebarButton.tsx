import React from 'react';

import styles from './sidebar-button.module.scss';

interface SidebarButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  umamiEvent?: string;
}

export function SidebarButton({
  children,
  className,
  umamiEvent,
  ...props
}: SidebarButtonProps) {
  return (
    <button
      {...props}
      className={`${styles.primaryBtn}` + (className ? ` ${className}` : '')}
      data-umami-event={umamiEvent}
    >
      {children}
    </button>
  );
}
