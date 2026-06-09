'use client';

import React from 'react';

import {Header} from '../header';
import {Footer} from '../footer';

import styles from './content-page-layout.module.scss';

interface ContentPageLayoutProps {
  children: React.ReactNode;
}

export function ContentPageLayout({children}: ContentPageLayoutProps) {
  return (
    <>
      <Header />
      <main className={styles.pageMain}>{children}</main>
      <Footer />
    </>
  );
}
