import React from 'react';
import {Route} from 'next';
import Link from 'next/link';

import styles from './not-found-page.module.scss';

export function NotFoundPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Page not found</h1>
      <p className={styles.paragraph}>
        {`Sorry 😔, we couldn't find what you were looking for.`}
        <br />
        {process.env.NODE_ENV === 'development' ? (
          <>
            <br />
            Try creating a page in{' '}
            <code className={styles.code}>src/pages/</code>.
            <br />
          </>
        ) : null}
        <br />
        <Link href={'/' as Route}>Go home</Link>.
      </p>
    </main>
  );
}
