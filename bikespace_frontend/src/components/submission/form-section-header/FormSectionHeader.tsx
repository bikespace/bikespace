import React from 'react';
import {FieldPath} from 'react-hook-form';
import {ErrorMessage} from '@hookform/error-message';

import {SubmissionSchema, useSubmissionFormContext} from '../schema';

import styles from './form-section-header.module.scss';

interface FormSectionHeaderProps {
  title: string;
  description?: string;
  name: FieldPath<SubmissionSchema>;
}

export function FormSectionHeader({
  title,
  description,
  name,
}: FormSectionHeaderProps) {
  const {
    formState: {errors},
  } = useSubmissionFormContext();

  return (
    <div className={styles.header}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      <span className={styles.error}>
        <ErrorMessage errors={errors} name={name} />
      </span>
    </div>
  );
}
