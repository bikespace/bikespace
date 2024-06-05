import React from 'react';
import {StaticImage} from 'gatsby-plugin-image';

import {FeedbackMailTo} from '../feedback-mail-to/FeedbackMailTo';

import * as styles from './submission-header.module.scss';

export function SubmissionHeader() {
  return (
    <header className={styles.header}>
      <StaticImage
        className={styles.headerLogo}
        src="../../../images/header-logo.svg"
        alt="bike space logo"
      />
      <FeedbackMailTo />
    </header>
  );
}