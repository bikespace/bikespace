import React, {useState, useEffect} from 'react';
import {IssueType} from '@/interfaces/Submission';
import {BaseButton} from '../base-button';

import styles from './issue.module.scss';

export const Issue = (props: {
  issues: IssueType[];
  onIssuesChanged: (issues: IssueType[]) => void;
}) => {
  const issues = props.issues;
  const handleClick = (e: React.FormEvent<HTMLInputElement>) => {
    const issueType = e.currentTarget.dataset.value as IssueType;

    let newIssues: IssueType[];
    if (!issues.includes(issueType)) {
      newIssues = [...issues, issueType];
    } else {
      newIssues = [...issues.filter(issue => issue !== issueType)];
    }
    props.onIssuesChanged(newIssues);
  };
  // Prevent interaction before hydration - required for e2e testing
  const [hydrated, setHydrated] = useState<boolean>(false);
  useEffect(() => setHydrated(true), []);

  return (
    <form className={styles.submissionIssue}>
      <fieldset>
        <legend>
          <h2>What was the issue?</h2>
          <h3>Choose at least one</h3>
        </legend>
        <BaseButton
          type="checkbox"
          name="issue"
          active={issues.includes(IssueType.NotProvided)}
          value="not_provided"
          onClick={handleClick}
          isDisabled={!hydrated}
        >
          Bicycle parking is&nbsp;<strong>not provided</strong>
        </BaseButton>
        <BaseButton
          type="checkbox"
          name="issue"
          active={issues.includes(IssueType.Full)}
          value="full"
          onClick={handleClick}
          isDisabled={!hydrated}
        >
          Bicycle parking is&nbsp;<strong>full</strong>
        </BaseButton>
        <BaseButton
          type="checkbox"
          name="issue"
          active={issues.includes(IssueType.Damaged)}
          value="damaged"
          onClick={handleClick}
          isDisabled={!hydrated}
        >
          Bicycle parking is&nbsp;<strong>damaged</strong>
        </BaseButton>
        <BaseButton
          type="checkbox"
          name="issue"
          active={issues.includes(IssueType.Abandoned)}
          value="abandoned"
          onClick={handleClick}
          isDisabled={!hydrated}
        >
          A bicycle is&nbsp;<strong>abandoned</strong>
        </BaseButton>
        <BaseButton
          type="checkbox"
          name="issue"
          active={issues.includes(IssueType.Other)}
          value="other"
          onClick={handleClick}
          isDisabled={!hydrated}
        >
          Something else
        </BaseButton>
      </fieldset>
    </form>
  );
};
