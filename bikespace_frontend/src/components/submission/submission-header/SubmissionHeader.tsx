import React from 'react';
import {StaticImage} from 'gatsby-plugin-image';

import {FeedbackMailTo} from '../feedback-mail-to/FeedbackMailTo';

import styles from './submission-header.module.scss';

export function SubmissionHeader() {
  return (
    <header className={styles.header}>
      <StaticImage
        className="header-logo"
        src="../images/header-logo.svg"
        alt="bike space logo"
      />
      <FeedbackMailTo />
    </header>
  );
}
