'use client';

import React from 'react';

import {Header} from '../header';
import {Footer} from '../footer';

import styles from './landing-layout.module.scss';

interface LandingLayoutProps {
  children: React.ReactNode;
}

export function LandingLayout({children}: LandingLayoutProps) {
  return (
    <>
      <Header />
      <main className={styles.pageMain}>{children}</main>
      <Footer />
    </>
  );
}
