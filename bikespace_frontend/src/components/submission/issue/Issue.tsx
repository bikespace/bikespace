import React from 'react';
import {ErrorMessage} from '@hookform/error-message';

import {IssueType} from '@/interfaces/Submission';

import {SelectInput} from '../select-input';

import {useSubmissionFormContext} from '../schema';

import {FormSectionHeader} from '../form-section-header';

import styles from './issue.module.scss';

export const Issue = () => {
  const {formState: errors} = useSubmissionFormContext();

  return (
    <div className={styles.submissionIssue}>
      <FormSectionHeader title="What were the issue(s)?" name="issues" />
      <fieldset>
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
