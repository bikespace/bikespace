import React from 'react';

import {FeedbackMailTo} from '../feedback-mail-to/FeedbackMailTo';

import styles from './submission-header.module.scss';

import bikespaceLogo from '@/assets/icons/header-logo.svg';

export function SubmissionHeader() {
  return (
    <header className={styles.header}>
      <a href="/">
        <img
          className={styles.headerLogo}
          src={bikespaceLogo.src}
          alt="bikespace logo"
        />
      </a>
      <FeedbackMailTo />
    </header>
  );
}
