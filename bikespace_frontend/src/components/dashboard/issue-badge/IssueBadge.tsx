import React from 'react';

import {IssueType} from '@/interfaces/Submission';

import styles from './issue-badge.module.scss';

interface IssueBadgeProps {
  issue: IssueType;
  labelForm?: 'short' | 'long';
}

export function IssueBadge({issue, labelForm = 'short'}: IssueBadgeProps) {
  return issueBadgeLabels[issue] ? (
    <div className={`${styles.issue} ${styles[issue]}`}>
      {labelForm === 'short'
        ? issueBadgeLabels[issue]
        : issueBadgeFullLabels[issue]}
    </div>
  ) : (
    <div className={styles.issue}>{issue}</div>
  );
}

const issueBadgeLabels = {
  [IssueType.NotProvided]: 'No nearby parking',
  [IssueType.Damaged]: 'Parking damaged',
  [IssueType.Abandoned]: 'Abandoned bicycle',
  [IssueType.Other]: 'Other issue',
  [IssueType.Full]: 'Parking full',
};

const issueBadgeFullLabels = {
  [IssueType.NotProvided]: 'Bicycle parking was not provided nearby',
  [IssueType.Damaged]: 'Bicycle parking was damaged',
  [IssueType.Abandoned]: 'Parked bicycle was abandoned',
  [IssueType.Other]: 'Other issue',
  [IssueType.Full]: 'Bicycle parking was full',
};
