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

interface SidebarLinkButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  umamiEvent?: string;
}

/** A link that looks like a button */
export function SidebarLinkButton({
  children,
  className,
  umamiEvent,
  ...props
}: SidebarLinkButtonProps) {
  return (
    <a
      className={[styles.primaryBtn, styles.filled, className].join(' ')}
      data-umami-event={umamiEvent}
      {...props}
    >
      {children}
    </a>
  );
}
