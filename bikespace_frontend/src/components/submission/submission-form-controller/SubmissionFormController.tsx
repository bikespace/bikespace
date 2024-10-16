import React from 'react';
import {Route} from 'next';
import {useRouter} from 'next/navigation';
import {FieldError} from 'react-hook-form';

import {useSubmissionFormContext} from '../schema';

import {FormOrder, formOrder} from '../constants';

import styles from './submission-form-controller.module.scss';

interface SubmissionFormControllerProps {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

export function SubmissionFormController({
  step,
  setStep,
}: SubmissionFormControllerProps) {
  const router = useRouter();

  const {
    trigger,
    watch,
    formState: {isSubmitted, isSubmitting, errors},
  } = useSubmissionFormContext();

  const issues = watch('issues');

  return (
    <div className={styles.formController}>
      {!isSubmitted && (
        <button
          type="button"
          className={`${styles.primaryBtnNoFill} ${
            step === 0 ? styles.hide : ''
          }`}
          onClick={() => {
            setStep(step - 1);
          }}
          data-umami-event={`back-button-from-${formOrder[step]}`}
        >
          Back
        </button>
      )}
      {isSubmitted && (
        <button
          type="button"
          className={styles.primaryBtnNoFill}
          onClick={() => router.push('/' as Route)}
          data-umami-event="close-button"
        >
          Close
        </button>
      )}
      <button
        type="button"
        className={`${styles.primaryBtn} ${
          step === formOrder.length - 1 ? styles.displayNone : ''
        }`}
        onClick={async () => {
          if (formOrder[step] === 'summary') {
            setStep(0);
          } else {
            const field = formOrder[step] as Exclude<'summary', FormOrder>;

            const isValid = await trigger(field);

            if (isValid) {
              setStep(step + 1);
            } else {
              alert(
                (errors[field] as FieldError[]).map(e => e.message).join(' ')
              );
            }
          }
        }}
        disabled={formOrder[step] === 'issues' && issues.length === 0}
        data-umami-event={`next-button-from-${formOrder[step]}`}
      >
        Next
      </button>
      {step === formOrder.length - 1 && !isSubmitted && (
        <button
          type="submit"
          className={styles.primaryBtn}
          data-umami-event="submit-issue-button"
          disabled={isSubmitting}
        >
          Submit
        </button>
      )}
    </div>
  );
}
