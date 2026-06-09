'use client';

import React from 'react';

import {Header} from '../header';
import {Footer} from '../footer';

import styles from './front-page-layout.module.scss';

interface FrontPageLayoutProps {
  children: React.ReactNode;
}

export function FrontPageLayout({children}: FrontPageLayoutProps) {
  return (
    <>
      <Header />
      <main className={styles.pageMain}>{children}</main>
      <Footer />
    </>
  );
}
