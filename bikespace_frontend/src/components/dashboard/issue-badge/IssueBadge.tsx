import React from 'react';

import {IssueType} from '@/interfaces/Submission';

import styles from './issue-badge.module.scss';

interface IssueBadgeProps {
  issue: IssueType;
}

const issueBadgeLabels = {
  not_provided: 'Bicycle parking was full',
  damaged: 'Bicycle parking was damaged',
  abandoned: 'Parked bicycle was abandoned',
  other: 'Other issue',
  full: 'Bicycle parking was full',
};

export function IssueBadge({issue}: IssueBadgeProps) {
  return issueBadgeLabels[issue] ? (
    <div className={`${styles.issue} ${styles[issue]}`}>
      {issueBadgeLabels[issue]}
    </div>
  ) : (
    <div className={styles.issue}>{issue}</div>
  );
}
