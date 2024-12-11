import React from 'react';
import {Route} from 'next';
import {useRouter} from 'next/navigation';

import {
  SubmissionPayload,
  SubmissionStatus,
  SubmissionResponsePayload,
} from '@/interfaces/Submission';

import styles from './submission-form-controller.module.scss';
import {OrderedComponentsType} from '../submission-form/SubmissionForm';

interface SubmissionFormControllerProps {
  submissionPayload: SubmissionPayload;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  submissionStatus: {status: string};
  setSubmissionStatus: React.Dispatch<
    React.SetStateAction<SubmissionResponsePayload>
  >;
  formOrder: OrderedComponentsType[];
}

export function SubmissionFormController({
  submissionPayload,
  step,
  setStep,
  submissionStatus,
  setSubmissionStatus,
  formOrder,
}: SubmissionFormControllerProps) {
  const router = useRouter();

  async function handleSubmit() {
    try {
      const response = await fetch(
        `${process.env.BIKESPACE_API_URL}/submissions`,
        {
          method: 'POST',
          body: JSON.stringify(submissionPayload),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error! status: ${response.status}`);
      }

      if (response.status === 201) {
        setSubmissionStatus({status: SubmissionStatus.Success});
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log('Error message: ', error.message);
        setSubmissionStatus({status: SubmissionStatus.Error});
      } else {
        console.log('unexpected error', error);
        setSubmissionStatus({status: SubmissionStatus.Error});
      }
    }
  }

  // disable "Next" button if no issue is selected
  const nextButtonDisabled =
    formOrder[step].label === 'Issue' && submissionPayload.issues.length === 0;

  const handleDataValidationWarning = () => {
    if (nextButtonDisabled) {
      alert('Please select at least one issue');
    }
  };

  const handleStepChanged = (i: number) => {
    if (i === -1 && step > 0 && submissionStatus.status === 'summary') {
      setStep(step - 1);
    } else if (i === 1 && step < formOrder.length - 1) {
      setStep(step + 1);
    } else if (i === -1 && step > 0 && submissionStatus.status !== 'summary') {
      router.push('/' as Route);
    }
    return true;
  };

  return (
    <div
      className={styles.formController}
      onClick={handleDataValidationWarning}
    >
      {/* 'Back' button logic */}
      {submissionStatus.status !== 'success' && (
        <button
          className={`${styles.primaryBtnNoFill} ${
            step === 0 ? styles.hide : ''
          }`}
          onClick={() => handleStepChanged(-1)}
          data-umami-event={`back-button-from-${formOrder[step].label}`}
        >
          Back
        </button>
      )}

      {/* 'Close' button logic */}
      {submissionStatus.status === 'success' && (
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
        onClick={() => handleStepChanged(1)}
        disabled={nextButtonDisabled}
        data-umami-event={`next-button-from-${formOrder[step].label}`}
      >
        Next
      </button>
      <button
        className={`${styles.primaryBtn} ${
          step === formOrder.length - 1 && submissionStatus.status === 'summary'
            ? ''
            : styles.displayNone
        }`}
        onClick={() => handleSubmit()}
        data-umami-event="submit-issue-button"
      >
        Submit
      </button>
    </div>
  );
}
