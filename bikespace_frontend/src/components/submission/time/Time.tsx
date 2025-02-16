import {ParkingDuration} from '@/interfaces/Submission';

import {useSubmissionFormContext} from '../submission-form/schema';

import {FormSectionHeader} from '../form-section-header';
import {SelectInput} from '../select-input';

import styles from './time.module.scss';

export const Time = () => {
  const {watch, setValue} = useSubmissionFormContext();

  const dateTime = watch('parkingTime.date');

  return (
    <div className={styles.submissionTime}>
      <label htmlFor="when">
        <FormSectionHeader
          title="When did this happen?"
          name="parkingTime.date"
        />
      </label>
      <input
        id="when"
        type="datetime-local"
        name="parkingTime.date"
        value={convertToDateTimeLocalString(dateTime)}
        onChange={e => {
          setValue('parkingTime.date', new Date(e.target.value));
        }}
        data-umami-event="date-time-dropdown"
      />
      <div>
        <FormSectionHeader
          title="How long did you need to park?"
          name="parkingTime.parkingDuration"
        />
        <fieldset className={styles.checkboxGroup}>
          {radioButtons.map(({value, label}) => (
            <SelectInput
              key={value}
              type="radio"
              name="parkingTime.parkingDuration"
              value={value}
            >
              {label}
            </SelectInput>
          ))}
        </fieldset>
      </div>
    </div>
  );
};

const radioButtons = [
  {
    value: ParkingDuration.Minutes,
    label: 'minutes',
  },
  {
    value: ParkingDuration.Hours,
    label: 'hours',
  },
  {
    value: ParkingDuration.Overnight,
    label: 'overnight',
  },
  {
    value: ParkingDuration.MultiDay,
    label: 'multiday',
  },
];

const convertToDateTimeLocalString = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);

  return `${year}-${month}-${day}T${hours}:${minutes}:00`;
};
