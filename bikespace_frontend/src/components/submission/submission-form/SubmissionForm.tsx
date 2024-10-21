import React, {useState} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';

import {ParkingDuration} from '@/interfaces/Submission';

import {SubmissionSchema, submissionSchema} from '../schema';

import {SubmissionProgressBar} from '../submission-progress-bar';
import {SubmissionFormController} from '../submission-form-controller';
import {SubmissionFormContent} from '../submission-form-content';

import styles from './submission-form.module.scss';

export function SubmissionForm() {
  const form = useForm<SubmissionSchema>({
    defaultValues: {
      issues: [],
      location: {
        // default location is the City Hall
        latitude: 43.65322,
        longitude: -79.384452,
      },
      parkingTime: {
        date: new Date(),
        parkingDuration: ParkingDuration.Minutes,
      },
      comments: '',
    },
    resolver: zodResolver(submissionSchema),
  });

  const [step, setStep] = useState<number>(0);

  const onSubmit = async (data: SubmissionSchema) => {
    try {
      const response = await fetch(
        'https://api-dev.bikespace.ca/api/v2/submissions',
        {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        form.setError('root.serverError', {
          message: `Error! status: ${response.status}`,
        });
      }
    } catch (error) {
      form.setError('root.unexpected', error as Error);
    }
  };

  return (
    <FormProvider {...form}>
      <form
        className={styles.mainContent}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <header>
          <SubmissionProgressBar step={step} />
        </header>
        <section className={styles.mainContentBody}>
          <SubmissionFormContent step={step} />
        </section>
        <footer>
          <SubmissionFormController step={step} setStep={setStep} />
        </footer>
      </form>
    </FormProvider>
  );
}
