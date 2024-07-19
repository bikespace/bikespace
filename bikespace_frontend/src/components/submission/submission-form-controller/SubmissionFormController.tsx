import React from 'react';
import {Route} from 'next';
import {useRouter} from 'next/navigation';

import {
  SubmissionPayload,
  SubmissionStatus,
  SubmissionResponsePayload,
} from '@/interfaces/Submission';

import styles from './submission-form-controller.module.scss';

interface SubmissionFormControllerProps {
  submissionPayload: SubmissionPayload;
  locationLoaded: boolean;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  submissionStatus: {status: string};
  setSubmissionStatus: React.Dispatch<
    React.SetStateAction<SubmissionResponsePayload>
  >;
  formOrder: string[];
}

export function SubmissionFormController({
  submissionPayload,
  locationLoaded,
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
        'https://api-dev.bikespace.ca/api/v2/submissions',
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

  const handleStepChanged = (i: number) => {
    if (!locationLoaded) {
      return false;
    }

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
    <div className={styles.formController}>
      {/* 'Back' button logic */}
      {submissionStatus.status !== 'success' && (
        <button
          className={`${styles.primaryBtnNoFill} ${
            step === 0 ? styles.hide : ''
          }`}
          onClick={() => handleStepChanged(-1)}
          data-umami-event={`back-button-from-${formOrder[step]}`}
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
        data-umami-event={`next-button-from-${formOrder[step]}`}
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
