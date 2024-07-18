import React from 'react';

import {Header} from '../header';

import styles from './landing-layout.module.scss';

export function LandingLayout({children}: any) {
  return (
    <>
      <Header />
      <main className={styles.pageMain}>
        {children}
      </main>
      <footer className={styles.pageFooter}>This will be a footer</footer>
    </>
  );
}
