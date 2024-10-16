import React from 'react';
import {useFormContext} from 'react-hook-form';
import {SubmissionSchema} from '../schema';

import styles from './select-input.module.scss';

import checkIcon from '@/assets/icons/check.svg';

interface SelectInputProps {
  type: 'checkbox' | 'radio';
  children: React.ReactNode;
  value: string;
  name: 'issues' | 'parkingTime.parkingDuration';
}

export function SelectInput({type, value, name, children}: SelectInputProps) {
  const {register} = useFormContext<SubmissionSchema>();

  const id = `${name}_${value}`;

  return (
    <div className={styles.inputContainer}>
      <input
        type={type}
        {...register(name)}
        value={value}
        id={id}
        data-value={value}
        data-umami-event={id}
      />
      <label htmlFor={id}>
        <div className={styles.baseButton}>
          {children}
          <img className={styles.check} src={checkIcon.src} alt="checkmark" />
        </div>
      </label>
    </div>
  );
}
