import React from 'react';
import {Route} from 'next';
import {useRouter} from 'next/navigation';

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
    formState: {isSubmitted, isSubmitSuccessful},
  } = useSubmissionFormContext();

  const issues = watch('issues');

  const handleStepChange = async () => {
    if (step > 0 && isSubmitSuccessful) {
      setStep(step - 1);
    } else if (formOrder[step] !== 'summary') {
      const isValid = await trigger(
        formOrder[step] as Exclude<'summary', FormOrder>
      );
      if (isValid) setStep(step + 1);
    } else if (step > 0 && !isSubmitSuccessful) {
      router.push('/' as Route);
    }

    return true;
  };

  return (
    <div className={styles.formController}>
      {!isSubmitted && (
        <button
          className={`${styles.primaryBtnNoFill} ${
            step === 0 ? styles.hide : ''
          }`}
          onClick={handleStepChange}
          data-umami-event={`back-button-from-${formOrder[step]}`}
        >
          Back
        </button>
      )}
      {!isSubmitted && (
        <button
          className={styles.primaryBtnNoFill}
          onClick={() => router.push('/' as Route)}
          data-umami-event="close-button"
        >
          Close
        </button>
      )}
      <button
        className={`${styles.primaryBtn} ${
          step === formOrder.length - 1 ? styles.displayNone : ' '
        }`}
        onClick={handleStepChange}
        disabled={formOrder[step] === 'issues' && issues.length === 0}
        data-umami-event={`next-button-from-${formOrder[step]}`}
      >
        Next
      </button>
      <button
        type="submit"
        className={`${styles.primaryBtn} ${
          step === formOrder.length - 1 && isSubmitSuccessful
            ? ''
            : styles.displayNone
        }`}
        data-umami-event="submit-issue-button"
      >
        Submit
      </button>
    </div>
  );
}
