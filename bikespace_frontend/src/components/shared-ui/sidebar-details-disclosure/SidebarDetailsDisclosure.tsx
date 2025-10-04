import React from 'react';

import styles from './sidebar-details-disclosure.module.scss';

interface SidebarDetailsDisclosureProps
  extends React.DetailsHTMLAttributes<HTMLDetailsElement> {
  umamiEvent?: string;
}

export function SidebarDetailsDisclosure({
  children,
  className,
  umamiEvent,
  ...props
}: SidebarDetailsDisclosureProps) {
  return (
    <details
      {...props}
      className={
        `${styles.sidebarDetailsDisclosure}` +
        (className ? ` ${className}` : '')
      }
      data-umami-event={umamiEvent}
    >
      {children}
    </details>
  );
}

export function SidebarDetailsContent({
  children,
  className,
  ...props
}: React.BaseHTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={
        `${styles.sidebarDetailsContent}` + (className ? ` ${className}` : '')
      }
    >
      {children}
    </div>
  );
}
