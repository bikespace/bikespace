'use client';

import React from 'react';

import styles from './lts-map-layout.module.scss';

export function LtsMapLayout({children}: {children: React.ReactNode}) {
  return <div className={styles.ltsMapLayout}>{children}</div>;
}
