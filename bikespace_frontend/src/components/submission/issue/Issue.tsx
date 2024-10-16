import React from 'react';

import {IssueType} from '@/interfaces/Submission';

import {SelectInput} from '../select-input';

import styles from './issue.module.scss';

export const Issue = () => {
  return (
    <div className={styles.submissionIssue}>
      <fieldset>
        <legend>
          <h2>What was the issue?</h2>
          <h3>Choose at least one</h3>
        </legend>
        {checkboxes.map(({value, label}) => (
          <SelectInput key={value} type="checkbox" name="issues" value={value}>
            {label}
          </SelectInput>
        ))}
      </fieldset>
    </div>
  );
};

const checkboxes = [
  {
    value: IssueType.NotProvided,
    label: (
      <span>
        Bicycle parking is&nbsp;<strong>not provided</strong>
      </span>
    ),
  },
  {
    value: IssueType.Full,
    label: (
      <span>
        Bicycle parking is&nbsp;<strong>full</strong>
      </span>
    ),
  },
  {
    value: IssueType.Damaged,
    label: (
      <span>
        Bicycle parking is&nbsp;<strong>damaged</strong>
      </span>
    ),
  },
  {
    value: IssueType.Abandoned,
    label: (
      <span>
        A bicycle is&nbsp;<strong>abandoned</strong>
      </span>
    ),
  },
  {
    value: IssueType.Other,
    label: <span>Something else</span>,
  },
];
