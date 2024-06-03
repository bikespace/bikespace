import React from 'react';

import * as styles from './submission-progress-bar.module.scss';

type SubmissionProgressBarProps = {
  step: number;
};

export function SubmissionProgressBar({step}: SubmissionProgressBarProps) {
  return (
    <header>
      <div className={styles.progressBar}>
        <div className={styles.middleLine} />
        {[0, 1, 2, 3, 4].map(s => (
          <div
            key={s}
            className={`${styles.step} ${s === step ? styles.active : ''}`}
          />
        ))}
      </div>
    </header>
  );
}
