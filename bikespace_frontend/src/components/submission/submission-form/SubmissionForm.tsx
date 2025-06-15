import {useState} from 'react';
import {useForm, FormProvider} from 'react-hook-form';

import {ParkingDuration} from '@/interfaces/Submission';
import {defaultMapCenter} from '@/utils/map-utils';

import {SubmissionSchema, submissionSchemaResolver} from './schema';

import {SubmissionProgressBar} from '../submission-progress-bar';
import {SubmissionFormController} from '../submission-form-controller';
import {SubmissionFormContent} from '../submission-form-content';

import styles from './submission-form.module.scss';

export function SubmissionForm() {
  const form = useForm<SubmissionSchema>({
    defaultValues: {
      issues: [],
      location: defaultMapCenter,
      parkingTime: {
        date: new Date(),
        parkingDuration: ParkingDuration.Minutes,
      },
      comments: '',
    },
    resolver: submissionSchemaResolver,
  });

  const [step, setStep] = useState<number>(0);

  const onSubmit = async (data: SubmissionSchema) => {
    try {
      const response = await fetch(
        `${process.env.BIKESPACE_API_URL}/submissions`,
        {
          method: 'POST',
          body: JSON.stringify({
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            issues: data.issues,
            parking_time: data.parkingTime.date,
            parking_duration: data.parkingTime.parkingDuration,
            comments: data.comments,
          }),
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
