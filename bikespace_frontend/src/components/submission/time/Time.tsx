import React from 'react';
import {ParkingDuration} from '@/interfaces/Submission';
import {BaseButton} from '../base-button';

import * as styles from './time.module.scss';

export const Time = (props: {
  parkingDuration: ParkingDuration;
  onParkingDurationChanged: (parkingDuration: ParkingDuration) => void;
  dateTime: Date;
  onDateTimeChanged: (dateTime: Date) => void;
}) => {
  const parkingDuration = props.parkingDuration;
  const dateTime = props.dateTime;

  const convertToDateTimeLocalString = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
  };

  const handleDateTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const chosenDateTime = new Date(e.currentTarget.value);
    props.onDateTimeChanged(chosenDateTime);
  };

  const handleClick = (e: React.FormEvent<HTMLInputElement>) => {
    props.onParkingDurationChanged(
      e.currentTarget.dataset.value as ParkingDuration
    );
  };

  return (
    <form className={styles.submissionTime}>
      <label htmlFor="when">
        <h2>When did this happen?</h2>
      </label>
      <input
        id="when"
        type="datetime-local"
        onChange={handleDateTime}
        value={convertToDateTimeLocalString(dateTime)}
        data-umami-event="date-time-dropdown"
      />
      <fieldset>
        <legend>
          <h2>How long did you need to park?</h2>
        </legend>
        <div className={styles.checkboxGroup}>
          <BaseButton
            type="radio"
            name="time"
            active={parkingDuration.includes(ParkingDuration.Minutes)}
            value="minutes"
            onClick={handleClick}
          >
            minutes
          </BaseButton>
          <BaseButton
            type="radio"
            name="time"
            active={parkingDuration.includes(ParkingDuration.Hours)}
            value="hours"
            onClick={handleClick}
          >
            hours
          </BaseButton>
          <BaseButton
            type="radio"
            name="time"
            active={parkingDuration.includes(ParkingDuration.Overnight)}
            value="overnight"
            onClick={handleClick}
          >
            overnight
          </BaseButton>
          <BaseButton
            type="radio"
            name="time"
            active={parkingDuration.includes(ParkingDuration.MultiDay)}
            value="multiday"
            onClick={handleClick}
          >
            multiday
          </BaseButton>
        </div>
      </fieldset>
    </form>
  );
};
